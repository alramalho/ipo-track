import axios from "axios";

const contact = (data: ContactData) =>
     axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
            email: data.email,
            subject: data.subject,
            message: data.message
        }
    )


export {contact}