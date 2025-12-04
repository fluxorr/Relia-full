import { Resend } from "resend";
import { MorningBriefEmail } from "@/components/morning-brief-email";

const resend = new Resend("re_T2ykVEbz_13aexPi1cgHrj9msYrrmakhv");

export async function GET() {
    try {

        const brief = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/morning-brief`
        ).then(r => r.json());

        const { summary, actionItems } = brief;

        resend.emails.send({
            from: "onboarding@resend.dev",
            to: "rahulgc545@gmail.com",
            subject: "Your Morning Brief",
            react: MorningBriefEmail({ summary, actionItems }),
        });


        return Response.json({ sent: true });
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
