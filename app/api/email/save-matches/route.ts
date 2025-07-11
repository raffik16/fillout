import { NextRequest, NextResponse } from 'next/server'
import { saveEmailSignup } from '@/lib/supabase'
import { Resend } from 'resend'
import { Drink } from '@/app/types/drinks'
import { WizardPreferences } from '@/app/types/wizard'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, matchedDrinks, preferences } = await request.json()
    
    if (!email || !matchedDrinks || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Save to database (allow duplicates)
    try {
      const saved = await saveEmailSignup(email, matchedDrinks, preferences)
      
      if (!saved) {
        console.log('Database save failed, but continuing with email send')
        // Continue with email sending even if database save fails
      }
    } catch (dbError) {
      console.error('Database error (continuing with email):', dbError)
      // Continue with email sending even if database save fails
    }
    
    // Send email with matches
    try {
      const { error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'Drink Wizard <onboarding@resend.dev>',
        to: [email],
        subject: '🍹 Your Perfect Drink Matches Are Here!',
        html: generateEmailHTML(matchedDrinks, preferences)
      })
      
      if (error) {
        console.error('Error sending email:', error)
        // Don't fail the request if email fails, but log it
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email saved and matches sent!',
        emailSent: !error
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      
      return NextResponse.json({
        success: true,
        message: 'Email saved but failed to send matches',
        emailSent: false
      })
    }
  } catch (error) {
    console.error('Error in email save API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateEmailHTML(matchedDrinks: Drink[], preferences: WizardPreferences): string {
  const drinksList = matchedDrinks.map(drink => `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin: 16px 0; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; backdrop-filter: blur(10px);">
          ${drink.category === 'cocktail' ? '🍹' : drink.category === 'beer' ? '🍺' : '🍷'}
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600;">${drink.name}</h3>
          <p style="margin: 0 0 12px 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.4;">${drink.description}</p>
          <div style="display: flex; gap: 12px; font-size: 12px; color: rgba(255,255,255,0.8);">
            <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 500;">${drink.category}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 500;">${drink.strength}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-weight: 500;">${drink.abv}% ABV</span>
          </div>
        </div>
      </div>
    </div>
  `).join('')
  
  const preferencesText = [
    preferences.category && `Category: ${preferences.category}`,
    preferences.flavor && `Flavor: ${preferences.flavor}`,
    preferences.strength && `Strength: ${preferences.strength}`,
    preferences.occasion && `Occasion: ${preferences.occasion}`
  ].filter(Boolean).join(' • ')
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Perfect Drink Matches</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 16px;">🍹✨</div>
            <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700;">Your Perfect Drink Matches!</h1>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">Crafted just for your taste 🎯</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 20px;">
            
            <!-- Preferences Section -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; margin-bottom: 32px; text-align: center;">
              <h3 style="margin: 0 0 12px 0; color: white; font-size: 18px; font-weight: 600;">🎯 Your Preferences</h3>
              <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 500;">${preferencesText}</p>
            </div>
            
            <!-- Drinks Section -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Your Matched Drinks</h2>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">We found ${matchedDrinks.length} perfect ${matchedDrinks.length === 1 ? 'match' : 'matches'} for you!</p>
            </div>
            
            ${drinksList}
            
            <!-- Footer CTA -->
            <div style="text-align: center; margin-top: 40px; padding: 24px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white;">
              <div style="font-size: 32px; margin-bottom: 12px;">🌟</div>
              <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Save This Email!</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.95;">
                New drinks added weekly - come back to discover more matches.
              </p>
              <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                📧 Don&apos;t see this email? Check your spam folder - even the best drinks sometimes end up in questionable places! 🍸
              </p>
            </div>
            
            <!-- Bottom -->
            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 2px solid #f3f4f6;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Happy drinking! 🥂<br>
                <strong style="color: #667eea;">The DrinkJoy Team</strong>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}