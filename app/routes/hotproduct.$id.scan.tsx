import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import {useLoaderData} from "@remix-run/react";

import db from "../db.server";
import {getCodeUrl, getByProductById, getByProductHandler} from "../models/HOTProducts.server";

export const loader = async ({ params }:any) => {
  // [START validate]
  invariant(params.id, "Could not find product handle");

  const id = String(params.id);
  // [END increment]
  const match = Number(id);
  const productURL = await getCodeUrl(match);
  const handler = await getByProductHandler(match);

  if(handler!==null && handler.id) {
    handler.counts = handler.counts + 1;
    const data = await db.hotProduct.update({where: {id: handler.id}, data: handler});
  }
  return json({
    getCodeUrl: productURL,
  });
};


export default function hotproduct() {
  const { getCodeUrl } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Product id : {getCodeUrl}</h1>
    </>
  );
}
