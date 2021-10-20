SENDER='alexandre.ramalho.1998@gmail.com'

def get_subject():
    return "Thank you for using IPO Warning, and farewell"


def get_body_html(keyword):
    return """
    <html>
        <head></head>
        <body>
          <h1>Thank you.</h1>
          <p>You are seeing this email because you previously subscribed to get an IPO email alert with the keyword "{keyword}" via ipo-warning.com.<p/>
          <p>By now you should have received the warning already. If that's not the case, please contact our support team at support@ipo-warning.com<p/>

          <small><p>If you don't know what this is about, please ignore this email.<small/>
        </body>
    </html>
    """.format(keyword=keyword)


def get_body_text(keyword):
    return """
    Thank you for using IPO Warning.
    You are seeing this email because you previously subscribed to get an IPO email alert with the keyword "{keyword}" via ipo-warning.com.
    By now you should have received the warning already. If that's not the case, please contact our support team at support@ipo-warning.com
    If you don't know what this is about, please ignore this email.
    """.format(keyword=keyword)