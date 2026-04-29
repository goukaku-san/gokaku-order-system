export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = process.env.NOTION_PRODUCT_DB_ID;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: '販売中', checkbox: { equals: true } },
        sorts: [{ property: '商品名', direction: 'ascending' }],
        page_size: 100,
      }),
    });
    const data = await response.json();
    const products = (data.results || []).map(p => ({
      id: p.id,
      name: p.properties['商品名']?.title?.[0]?.plain_text || '',
      sku: p.properties['SKU']?.rich_text?.[0]?.plain_text || '',
      price: p.properties['単価']?.number || 0,
      unit: p.properties['単位']?.select?.name || '個',
      brand: p.properties['屋号']?.select?.name || '',
      category: p.properties['カテゴリ']?.multi_select?.map(c => c.name) || [],
    }));
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
