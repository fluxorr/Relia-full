import axios from "axios";


async function getMails() {
    const response = await axios.get('http://localhost:3000/api/gmail/messages')
    return response.data
}

type MailType = {
    id: string,
    snippet: string,
    subject: string,
    from: string,
    date: string,
    body: string

}

export default async function MailList() {

    const mails = await getMails()
    console.log(mails)


    return (

        <div className="flex flex-col gap-16 h-screen items-center  ">
            <h1 className="text-4xl text-neutral-200" >Mails </h1>


            <ul className="text-neutral-400 grow w-full max-w-[80%] overflow-y-auto custom-scrollbar " >
                {mails.map((mail: MailType) => (
                    <li key={mail.id} className="flex justify-center">
                        <div className="flex flex-col gap-2 text-sm border w-full text-left border-neutral-200 my-2 px-4 py-2 wrap-break-word ">
                            <div className="" >{mail.snippet}</div>
                            <div className="text-lg text-neutral-300" >{mail.subject}</div>
                            <div>{mail.from}</div>
                            <div>{mail.date}</div>
                            <div>{mail.body}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

    );
}
