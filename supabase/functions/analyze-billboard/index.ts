import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, reportId, location } = await req.json();
    console.log('Analyzing billboard image:', { reportId, imageUrl, location });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update report status to analyzing
    await supabase
      .from('billboard_reports')
      .update({ status: 'analyzing' })
      .eq('id', reportId);

    // Analyze image with GPT-4 Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI system that analyzes billboard images for violations in Indian cities. 
            Analyze the image and identify violations in these categories:
            1. SIZE: Check if billboard exceeds standard dimensions (12×20 ft, 8×15 ft)
            2. LOCATION: Check if placed inappropriately (near intersections, blocking signs)
            3. STRUCTURAL: Look for structural damage, poor installation, safety hazards
            4. CONTENT: Check for obscene, misleading, or inappropriate content
            
            Provide response as JSON with violations array containing: type, severity (low/medium/high/critical), description, confidence (0-100).`
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Analyze this billboard image for violations. Location: ${location.address || 'Unknown'}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    const aiResult = await response.json();
    console.log('OpenAI response:', aiResult);

    let violations = [];
    
    if (aiResult.choices?.[0]?.message?.content) {
      try {
        const analysisResult = JSON.parse(aiResult.choices[0].message.content);
        violations = analysisResult.violations || [];
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        // Fallback: create violation from raw text
        violations = [{
          type: 'structural',
          severity: 'medium',
          description: aiResult.choices[0].message.content.substring(0, 200),
          confidence: 85
        }];
      }
    }

    // Check location violations against restricted zones
    const { data: restrictedZones } = await supabase
      .from('restricted_zones')
      .select('*');

    if (restrictedZones) {
      for (const zone of restrictedZones) {
        const distance = calculateDistance(
          location.lat, location.lng,
          zone.location_lat, zone.location_lng
        );
        
        if (distance <= zone.radius_meters) {
          violations.push({
            type: 'location',
            severity: 'high',
            description: `Located within ${Math.round(distance)}m of ${zone.zone_name} (${zone.zone_type}). Minimum distance: ${zone.radius_meters}m required.`,
            confidence: 95
          });
        }
      }
    }

    // Insert violations into database
    if (violations.length > 0) {
      const violationRecords = violations.map((violation: any) => ({
        report_id: reportId,
        violation_type: violation.type,
        severity: violation.severity,
        description: violation.description,
        confidence_score: violation.confidence || 85
      }));

      const { error: violationError } = await supabase
        .from('violations')
        .insert(violationRecords);

      if (violationError) {
        console.error('Error inserting violations:', violationError);
      }
    }

    // Update report status to completed
    await supabase
      .from('billboard_reports')
      .update({ status: 'completed' })
      .eq('id', reportId);

    return new Response(
      JSON.stringify({
        success: true,
        violations,
        reportId,
        violationCount: violations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-billboard function:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}