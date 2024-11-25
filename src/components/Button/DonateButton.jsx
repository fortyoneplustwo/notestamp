import React from 'react'

const DonateButton = () => {
  return (
    <form action="https://www.paypal.com/donate" method="post" target="_top">
      <input type="hidden" name="business" value="L7VEWD374RJ38" />
      <input type="hidden" name="no_recurring" value="0" />
      <input type="hidden" name="item_name" value="Help me dedicate more time to developing this application and keep it free." />
      <input type="hidden" name="currency_code" value="CAD" />
      <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
      <img alt="" border="0" src="https://www.paypal.com/en_CA/i/scr/pixel.gif" width="1" height="1" />
    </form>
  )
}

export default DonateButton
