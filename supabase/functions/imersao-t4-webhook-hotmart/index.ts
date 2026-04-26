import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Hotmart Webhook T4:', JSON.stringify(payload))

    const status = payload.data?.purchase?.status || payload.status
    const sck = payload.data?.origin?.sck || payload.data?.purchase?.sck || payload.sck
    const buyerEmail = payload.data?.buyer?.email || payload.buyer?.email
    const buyerName = payload.data?.buyer?.name || payload.buyer?.name
    const productName = payload.data?.product?.name || payload.product?.name
    const amount = payload.data?.purchase?.price?.value || payload.price

    if (status === 'APPROVED') {
      console.log(`Processing approved sale for: ${buyerEmail}`)

      // 1. CRIAR PERFIL PARA O COMPRADOR (Para ele poder indicar também)
      // Geramos um ref_code baseado no primeiro nome + 4 números aleatórios
      const firstName = (buyerName || 'USER').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '')
      const randomId = Math.floor(1000 + Math.random() * 9000)
      const newRefCode = `${firstName}${randomId}`

      const { data: newProfile, error: profileError } = await supabase
        .from('imersao_t4_profiles')
        .upsert({ 
          email: buyerEmail.toLowerCase(), 
          name: buyerName,
          ref_code: newRefCode // Só insere se não existir (upsert com email como unique)
        }, { onConflict: 'email' })
        .select()
        .single()

      if (profileError) {
          console.error('Error creating profile:', profileError)
      } else {
          console.log(`Profile ready for buyer: ${buyerEmail} with code ${newRefCode}`)
      }

      // 2. REGISTRAR A INDICAÇÃO (Se houver sck)
      if (sck) {
        const { data: referrer, error: refError } = await supabase
            .from('imersao_t4_profiles')
            .select('id, email')
            .eq('ref_code', sck)
            .single()

        if (!refError && referrer && referrer.email !== buyerEmail) {
            const { error: insertError } = await supabase
                .from('imersao_t4_purchases')
                .insert({
                    buyer_email: buyerEmail,
                    ref_code: sck,
                    referrer_id: referrer.id,
                    product_name: productName,
                    amount: amount,
                    status: 'APPROVED'
                })
            
            if (insertError && insertError.code === '23505') {
                console.log('Purchase already recorded, skipping.')
            } else if (insertError) {
                console.error('Error inserting purchase:', insertError)
            } else {
                console.log(`Sale attributed to ${sck} successfully!`)
            }
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Webhook processed' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
