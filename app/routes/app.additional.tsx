import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  BlockStack, Label, Card
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import {getSampleUrl} from "../models/HOTProducts.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const appURL = process.env.APP_URL;
  const codeURL = await getSampleUrl();
  return json({
    appURL,
    codeURL
  });
};

export default function Index() {
  // @ts-ignore
  const { appURL,codeURL } = useLoaderData();
  const navigate = useNavigate();

  // [START page]
  return (
    <Page>
      <ui-title-bar title="Hot Products">
        <button variant="primary" onClick={() => navigate("/app")}>
          Hot Products List
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Label id={"show-url"}>
                App URL : {appURL}
              </Label>
            </BlockStack>

            <BlockStack gap="500">
              <Label id={"show-url"}>
                Sample Product URL : {codeURL}
              </Label>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
  // [END page]
}
