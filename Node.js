// Importa el cliente desde la web
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://oxcvsiigbaezifoniqbz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y3ZzaWlnYmFlemlmb25pcWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTA0NTQsImV4cCI6MjA4MjcyNjQ1NH0.OYeRSNpuDy9HgZNoDZS5D6hlOP4EylPHPlTVdNrV5wI' // La clave "anon public" de tu panel

const supabase = createClient(supabaseUrl, supabaseKey)

// Función de ejemplo para insertar datos
async function guardarMetrica(valor) {
  const { data, error } = await supabase
    .from('metricas') // Nombre de tu tabla
    .insert([{ valor_bi: valor }])
  
  if (error) console.log('Error:', error)
  else console.log('Guardado:', data)
}