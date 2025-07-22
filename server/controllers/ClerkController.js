import { verifyWebhook } from '@clerk/express/webhooks' 
import DBUser from '../models/UserModel.js'


export const onSignup = async (req, res) => {
    // Verify and process the webhook event
    try {
      const evt = await verifyWebhook(req)
  

      const { id, email_addresses, first_name, last_name, image_url } = evt.data
      const eventType = evt.type
      if(eventType === "user.created") {
        await DBUser.create({
            _id: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
        })
    } else if(eventType === "user.updated") {
        await DBUser.findByIdAndUpdate(id, {
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
        })
    } else if(eventType === "user.deleted") {
        await DBUser.findByIdAndDelete(id)
    }
      console.log('Webhook event processed:', evt)
      return res.status(201).send('New user created')
    } catch (err) {
      console.error('Error:', err)
      return res.status(400).send('Error in onSignup')
    }
}


