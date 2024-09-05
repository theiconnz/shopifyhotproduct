import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return json({ showForm: Boolean(login) });
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Shopify Hot Products</h1>
        <p className={styles.text}>
          Show hot product badge in product view page.
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Count No of product views in frontend
          </li>
          <li>
            <strong>Product feature</strong>. Show No of product views in backend
          </li>
          <li>
            <strong>Product feature</strong>. Show Hot Product badge in product view page is it has higher views
          </li>
        </ul>
      </div>
    </div>
  );
}
