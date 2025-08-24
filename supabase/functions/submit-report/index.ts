import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageFile, location } = await req.json();
    console.log('Submitting billboard report for user:', user.id);

    // Upload image to storage
    const fileName = `${user.id}/${Date.now()}-billboard.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('billboard-images')
      .upload(fileName, imageFile, {
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('billboard-images')
      .getPublicUrl(fileName);

    // Create billboard report
    const { data: reportData, error: reportError } = await supabase
      .from('billboard_reports')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        location_lat: location.lat,
        location_lng: location.lng,
        location_address: location.address,
        status: 'pending'
      })
      .select()
      .single();

    if (reportError) {
      console.error('Report creation error:', reportError);
      return new Response(
        JSON.stringify({ error: 'Failed to create report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trigger AI analysis (call analyze-billboard function)
    const analysisResponse = await supabase.functions.invoke('analyze-billboard', {
      body: {
        imageUrl: publicUrl,
        reportId: reportData.id,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address
        }
      }
    });

    if (analysisResponse.error) {
      console.error('Analysis trigger error:', analysisResponse.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId: reportData.id,
        message: 'Report submitted successfully. AI analysis in progress.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-report function:', error);
    return new Response(
      JSON.stringify({ error: 'Report submission failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});