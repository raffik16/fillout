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
    
    // Save to database
    const saved = await saveEmailSignup(email, matchedDrinks, preferences)
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save email signup' },
        { status: 500 }
      )
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
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937;">${drink.name}</h3>
      <p style="margin: 0 0 8px 0; color: #6b7280;">${drink.description}</p>
      <div style="display: flex; gap: 16px; font-size: 14px; color: #9ca3af;">
        <span>${drink.category}</span>
        <span>${drink.strength}</span>
        <span>${drink.abv}% ABV</span>
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
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #f59e0b; margin: 0;">🍹 Your Perfect Drink Matches!</h1>
          <p style="color: #6b7280; margin: 8px 0;">Don't let these liquid treasures swim away!</p>
        </div>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937;">Your Preferences</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${preferencesText}</p>
        </div>
        
        <h2 style="color: #1f2937; margin: 24px 0 16px 0;">Your Matched Drinks</h2>
        ${drinksList}
        
        <div style="text-align: center; margin: 32px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Save this email for your next visit! 🌟<br>
            New drinks added weekly - come back to discover more matches.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            Happy drinking! 🥂<br>
            The Drink Wizard Team
          </p>
        </div>
      </body>
    </html>
  `
}