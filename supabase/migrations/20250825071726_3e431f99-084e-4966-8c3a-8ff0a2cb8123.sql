-- Update the storage bucket to be public so users can access their images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'billboard-images';