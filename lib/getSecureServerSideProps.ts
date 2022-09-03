import { GetServerSidePropsContext } from "next";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";

export default function getSecureServerSideProps(
  callback: (context: GetServerSidePropsContext, token: any) => void,
  requireAdmin?: boolean
) {
  return async (context: GetServerSidePropsContext) => {
    const cookies = nookies.get(context);
    const redirectUrl = context.req.url?.startsWith("/_next") ? "/" : context.req.url;

    let token = null;
    try {
      token = await admin.verifySessionCookie(cookies.session);
    } catch (error) {
      return {
        redirect: {
          permanent: false,
          destination: `/login?redirect=${redirectUrl}`,
        },
      };
    }

    if (token.role && !["admin", "editor"].includes(token.role)) {
      return {
        redirect: {
          permanent: false,
          destination: `/login?redirect=${redirectUrl}&unauthorized=true`,
        },
      };
    }

    if (requireAdmin && token.role !== "admin") {
      return {
        redirect: {
          permanent: false,
          destination: `/login?redirect=${redirectUrl}&unauthorized=true`,
        },
      };
    }

    //Await is required in case the callback is async
    return await callback(context, token);
  };
}
