export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const HEADER_DB = process.env.NOTION_HEADER_DB_ID;
  const DETAIL_DB = process.env.NOTION_DETAIL_DB_ID;

  // POST: 新規発注申請
  if (req.method === 'POST') {
    const { header, items } = req.body;
    try {
      // 1. ヘッダ作成
      const headerRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: { database_id: HEADER_DB },
          properties: {
            '発注番号': { title: [{ text: { content: `PO-${Date.now()}` } }] },
            'ステータス': { select: { name: '申請中' } },
            'チャネル': { select: { name: header.channel } },
            '申請者名': { rich_text: [{ text: { content: header.applicantName } }] },
            '申請者ロール': { select: { name: header.applicantRole } },
            '合計金額': { number: header.totalAmount },
            '備考': { rich_text: [{ text: { content: header.note || '' } }] },
            '申請日': { date: { start: new Date().toISOString().split('T')[0] } },
          },
        }),
      });
      const headerData = await headerRes.json();
      const headerId = headerData.id;

      // 2. 明細作成
      for (const item of items) {
        await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: DETAIL_DB },
            properties: {
              '明細名': { title: [{ text: { content: `${item.productName}_${Date.now()}` } }] },
              '発注ヘッダ': { relation: [{ id: headerId }] },
              '仕入先': { rich_text: [{ text: { content: item.supplier || '' } }] },
              '数量': { number: item.quantity },
              '単位': { select: { name: item.unit } },
              '適用単価': { number: item.unitPrice },
              '小計': { number: item.quantity * item.unitPrice },
              '納品先': { select: { name: item.deliveryTo } },
              '勘定科目': { select: { name: item.accountItem || '仕入高' } },
            },
          }),
        });
      }

      res.status(200).json({ success: true, id: headerId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // PATCH: ステータス更新（承認・却下）
  else if (req.method === 'PATCH') {
    const { pageId, status, rejectReason } = req.body;
    try {
      const props = {
        'ステータス': { select: { name: status } },
      };
      if (status === '承認済') {
        props['承認日'] = { date: { start: new Date().toISOString().split('T')[0] } };
      }
      if (status === '却下' && rejectReason) {
        props['却下理由'] = { rich_text: [{ text: { content: rejectReason } }] };
      }
      if (status === '受領済') {
        props['受領確認日'] = { date: { start: new Date().toISOString().split('T')[0] } };
      }

      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: props }),
      });
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
