import axios from "axios";

const subscribe = (data: FormData) =>
     axios.post(`${process.env.API_URL}/subscribe`, {
            email: data.email,
            keyword: data.keyword
        }
    )


export {subscribe}