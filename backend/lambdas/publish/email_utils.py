SENDER='alexandre.ramalho.1998@gmail.com'

def get_subject(ipo_name):
    return "{ipo_name} is going public!".format(ipo_name=ipo_name)
            

def get_body_html(ipo_name):
    return """
    <html>
        <head></head>
        <body>
          <h1>{ipo_name} is making an IPO!</h1>
          <a href="https://stockanalysis.com/ipos/calendar/">Click here to know the details.<a/>
          
          <small><p>If this is not the company you were looking for, email us at support@ipo-warning.com
          <small/>
        </body>
    </html>
    """.format(ipo_name=ipo_name)
    
    
def get_body_text(ipo_name):
    return """
    Your IPO will go public!
    {ipo_name} is finally listed to go public in the future!
    Go to https://stockanalysis.com/ipos/calendar to find more.
    """.format(ipo_name=ipo_name)