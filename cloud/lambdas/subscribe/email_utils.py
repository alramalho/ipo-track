SENDER='alexandre.ramalho.1998@gmail.com'

def get_subject(keyword):
    return "Confirming IPO alert subscription for '{keyword}'".format(keyword=keyword)


def get_body_html(keyword):
    return """
    <html>
        <head></head>
        <body>
          <h1>Thank you for using IPO Warning.</h1>
          <p>You are seeing this email because you subscribed to get an IPO email alert with the keyword "{keyword}" via ipo-warning.com.<p/>

          <small><p>If you don't know what this is about, please ignore this email.<small/>
        </body>
    </html>
    """.format(keyword=keyword)


def get_body_text(keyword):
    return """
    Thank you for using IPO Warning.
    You are seeing this email because you subscribed to get an IPO email alert with the keyword "{keyword}" via ipo-warning.com.
    If you don't know what this is about, please ignore this email.
    """.format(keyword=keyword)