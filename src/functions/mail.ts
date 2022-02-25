require('dotenv').config();
const mailgun = require("mailgun-js");
const DOMAIN = 'mail.bmoneyenterprises.com';
const api_key = process.env.mailgun_key
const mg = mailgun({apiKey: api_key, domain: DOMAIN});


export default function sendMail(recipient: string, email_type: string, token: string){

    let sub: string = ""
    if(email_type == "verification")
    {	
        sub = "Your BMoney University Activation Code"
    }
    else if(email_type == "set_cancel") {
        sub = "Your subscription is set to cancel"
    }
    else if(email_type == "final_cancel") {
        sub = "Your subscription has been officially cancelled"
    }
    var data = {
        from: 'BMoney Enterprises <activate@bmoneyenterprises.com>',
        to: recipient,
        subject: sub,
        template: email_type,
        'v:newToken': token,
        // inline: ['./email_templates/images/3c9f52d8-b4d3-4efb-bcb0-6b8a662335b0.png',
        // './email_templates/images/61c26547-274c-4fbb-a4b4-80d00d83c495.png',
        // './email_templates/images/apple-touch-icon.png',
        // './email_templates/images/instagram2x.png',
        // './email_templates/images/linkedin2x.png',
        // './email_templates/images/twitter2x.png' ]
        
    };

    mg.messages().send(data, function (error: Error, body: any) {
        if(error) console.log(error);
        console.log(body);
    });
}
