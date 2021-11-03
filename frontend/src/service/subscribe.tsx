import axios from "axios";

const subscribe = (data: FormData) =>
     axios.post(`${process.env.NEXT_PUBLIC_API_URL}/subscribe`, {
            email: data.email,
            keyword: data.keyword
        }
    )


export {subscribe}