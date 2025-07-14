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
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="background: #4f46e5; width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
          ${drink.category === 'cocktail' ? '🍹' : drink.category === 'beer' ? '🍺' : '🍷'}
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 18px; font-weight: 600;">${drink.name}</h3>
          <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.4;">${drink.description}</p>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; margin-top: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-weight: 500; min-width: 60px;">Category:</span>
              <span style="color: #475569; text-transform: capitalize;">${drink.category}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-weight: 500; min-width: 60px;">Strength:</span>
              <span style="color: #475569; text-transform: capitalize;">${drink.strength}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-weight: 500; min-width: 60px;">ABV:</span>
              <span style="color: #475569;">${drink.abv}%</span>
            </div>
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 20px; background-color: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: #4f46e5; padding: 40px 20px; text-align: center; color: white;">
            <div style="font-size: 40px; margin-bottom: 16px;">🍹</div>
            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: white;">Your Perfect Drink Matches!</h1>
            <p style="margin: 0; font-size: 16px; opacity: 0.9; color: white;">Crafted just for your taste</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 20px;">
            
            <!-- Preferences Section -->
            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 600;">🎯 Your Preferences</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px;">${preferencesText}</p>
            </div>
            
            <!-- Drinks Section -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Your Matched Drinks</h2>
              <p style="color: #64748b; margin: 0; font-size: 14px;">We found ${matchedDrinks.length} perfect ${matchedDrinks.length === 1 ? 'match' : 'matches'} for you!</p>
            </div>
            
            ${drinksList}
            
            <!-- Footer CTA -->
            <div style="text-align: center; margin-top: 40px; padding: 24px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 12px;">🌟</div>
              <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Save This Email!</h3>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                New drinks added weekly - come back to discover more matches.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                📧 Don&apos;t see this email? Check your spam folder - even the best drinks sometimes end up in questionable places! 🍸
              </p>
            </div>
            
            <!-- Bottom -->
            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Happy drinking! 🥂<br>
                <strong style="color: #4f46e5;">The DrinkJoy Team</strong>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}