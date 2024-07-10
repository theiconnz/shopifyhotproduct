import db from '../db.server'

export async function getByProductHandler(data){
  const hproduct = await db.hotProduct.findFirst({
    where: { handle: data.handle },
  });
  return hproduct;
}

export async function getSampleUrl(){
  const hproduct = await db.hotProduct.findMany({
    select:{
      handle : true
    }
  });

  if(hproduct!==null) {
    var row = [];
    hproduct.forEach((item) => {
      row.push(item.handle);
    });
    return new URL('/hotproduct/'+row[0]+'/scan', process.env.SHOPIFY_APP_URL);
  }
  return "";
}

export async function getByProductById(productId, graphql){
  const hproduct = await db.hotProduct.findFirst({
    where: { id: productId },
  });
  if (hproduct === null) return hproduct;
  return supplementHotProducts(hproduct, graphql);
}

export async function createHotProduct(productId){
  const hproduct = await db.hotProduct.findFirst({
    where: { productVariantId: productId },
  });
  if (hproduct === null) return [];
  return hproduct;
}

export function getCodeUrl(handle) {
  const URLink = new URL('/hotproduct/'+handle+'/scan', process.env.SHOPIFY_APP_URL);
  return URLink.href;
}

export function getRedirectUrl(id) {
  const URLink = new URL('/hotproduct/'+id+'/scan', process.env.SHOPIFY_APP_URL);
  return URLink.href;
}

export async function getHPIds(){
  const hproducts = await db.hotProduct.findMany({
    select:{
      productId : true
    }
  });
  if (hproducts.length === 0) return [];
  var row = [];
  hproducts.forEach((item) => {
    row.push(item);
  });
  return row;
}

export async function getHotProducts(shop, graphql){
  const hproducts = await db.hotProduct.findMany({
    where: {shop},
    orderBy: { counts: "desc" },
  });

  if (hproducts.length === 0) return [];
  return Promise.all(
    hproducts.map((item) => supplementHotProducts(item, graphql))
  );
}


// [START hydrate-hotproducts]
async function supplementHotProducts(HotProduct, graphql) {
    const response = await graphql(
        `
      query supplementHotProducts($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          images(first: 1) {
            nodes {
              altText
              url
            }
          }
        }
      }
    `,
        {
            variables: {
                id: HotProduct.productId,
            },
        }
    );

    const {
        data: { product },
    } = await response.json();

    return {
      ...HotProduct,
      productId: !product?.id,
      productDeleted: !product?.title,
      productTitle: product?.title,
      handle: product?.handle,
      productImage: product?.images?.nodes[0]?.url,
      productAlt: product?.images?.nodes[0]?.altText,
    };
}
// [END hydrate-hotproducts]


// [START validate-hotproducts]
export function validateHotProducts(data) {
    const errors = {};

    if (!data.productId) {
        errors.productId = "Product id is required";
    }

    if (!data.handle) {
      errors.productId = "Product Handle is required";
    }

    if (!data.counts) {
        errors.counts = "Product Counts is required";
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}
// [END validate-hotproducts]
