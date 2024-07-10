import { useState } from "react";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  Divider,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import {getByProductHandler, getByProductById, validateHotProducts, getHPIds} from "../models/HOTProducts.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  if (params.id === "new") {
    return json({
      destination: "product",
      title: "",
    });
  }
  return json(await getByProductById(Number(params.id), admin.graphql));
};

export async function action({ request, params }:any) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop
  };

  // @ts-ignore
  if (data.action === "delete") {
    await db.hotProduct.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  //json({ data }, { status: 422 });
  const errors = validateHotProducts(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  // @ts-ignore
  if( params.id === "new" && data.handler!='') {
    // @ts-ignore
    const hotproduct=await getByProductHandler(data);

    if (hotproduct !== null) {
      return redirect(`/app`);
    }
  }

  // @ts-ignore
  data.counts=Number(data.counts);
  const hotproduct =
    params.id === "new"
      ? await db.hotProduct.create({ data })
      : await db.hotProduct.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app`);
}


export default function HotProductForm() {
  const errors = useActionData<typeof action>()?.errors || {};
  const hotproduct= useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [formState, setFormState] = useState(hotproduct);
  const [cleanFormState, setCleanFormState] = useState(hotproduct);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";
  // [END state]

  function handleKey(handle:any) {
    const match = /gid:\/\/shopify\/Product\/([0-9]+)/.exec(handle);
    // @ts-ignore
    return match[1];
  }
  // [START save]
  const submit = useSubmit();

  function handleSave() {
    const data = {
      productId: formState.productId || "",
      handle: handleKey(formState.productId) || "",
      counts: 0
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }


  // [START select-product]
  async function selectProduct() {
    //const selectedids=getHPIds();
    // @ts-ignore
    const products = await window.shopify.resourcePicker({
      type: 'product',
      action: "select",
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0].id,
        productTitle: title,
        handle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }
  // [END select-product]


  // @ts-ignore
  // @ts-ignore
  return (
    <Page>
      {/* [START breadcrumbs] */}
      {/* [END breadcrumbs] */}
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* [START title] */}
            <Card>
              <BlockStack gap="500">
                {/* [START product] */}
                <InlineStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  {formState.productId ? (
                    <Button variant="plain" onClick={selectProduct}>
                      Change product
                    </Button>
                  ) : null}
                </InlineStack>
                {formState.productId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Thumbnail
                      source={formState.productImage || ImageIcon}
                      alt={formState.productAlt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.productTitle}
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack  inlineAlign="center" gap="200">
                    <Button fullWidth={false} size={"medium"} onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                    {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </BlockStack>
                )}
                {/* [END product] */}
                <Bleed marginInlineStart="200" marginInlineEnd="200">
                  <Divider />
                </Bleed>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !hotproduct.id || !hotproduct || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
