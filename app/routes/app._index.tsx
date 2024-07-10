import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  EmptyState,
  Thumbnail,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

import {getCodeUrl, getHotProducts} from "../models/HOTProducts.server";
import { AlertDiamondIcon } from "@shopify/polaris-icons";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const hotproducts = await getHotProducts(session.shop, admin.graphql);
  const productURL = await getCodeUrl('wide-leg-palazzo-pants-1');

  return json({
    hotproducts,
    productURL
  });
};


// [START table]
const HotTable = ({hotproducts}:any) => (
  <IndexTable
    resourceName={{
      singular: "Hot Product",
      plural: "Hot Products",
    }}
    itemCount={hotproducts.length}
    headings={[
      { title: "Thumbnail"},
      { title: "Product" },
      { title: "Counts" },
    ]}
    selectable={false}
  >
    {hotproducts.map((item:any) => (
      <HOTPableRow key={item.id} hotItem={item} />
    ))}
  </IndexTable>
);
// [END table]


// [START row]
const HOTPableRow = ({ hotItem }:any) => (
  <IndexTable.Row id={hotItem.id} position={hotItem.id}>
    <IndexTable.Cell>
      <Thumbnail
        source={hotItem.productImage || hotItem}
        alt={hotItem.productTitle}
        size="small"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>
      {hotItem.productTitle}
    </IndexTable.Cell>
    <IndexTable.Cell>{hotItem.counts}</IndexTable.Cell>
  </IndexTable.Row>
);
// [END row]


// [START empty]
const EmptyHotPState = ({ onAction }:any) => (
  <EmptyState
    heading="Could not found any Hot Products"
    action={{
      content: "Create Hot Product",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Allow customers to visit the products.</p>
  </EmptyState>
);
// [END empty]


export default function Index() {
  // @ts-ignore
  const { hotproducts, productURL } = useLoaderData();
  const navigate = useNavigate();

  // [START page]
  return (
    <Page>
      <ui-title-bar title="Hot Products">
        <button variant="primary" onClick={() => navigate("hotproduct/new")}>
          Hot Products
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {(hotproducts===undefined || hotproducts.length === 0 ) ? (
              <EmptyHotPState  onAction={() => navigate("hotproduct/new")} />
            ) : (
              <HotTable hotproducts={hotproducts} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
  // [END page]
}
