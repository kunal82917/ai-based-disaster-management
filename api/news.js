export default async function handler(req, res) {
    // Allow CORS for frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const apiKey = process.env.GNEWS_API_KEY || 'fdfb9e5b394271a3b276d5b9c8d0f00e';

        const url = new URL('https://gnews.io/api/v4/search');
        url.searchParams.set('q', 'flood OR cyclone OR earthquake OR landslide OR disaster OR storm OR heatwave');
        url.searchParams.set('lang', 'en');
        url.searchParams.set('country', 'in');
        url.searchParams.set('max', '10');
        url.searchParams.set('sortby', 'publishedAt');
        url.searchParams.set('token', apiKey);

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return res.status(response.status).json({
                error: 'GNews upstream request failed',
                status: response.status,
                details: errorBody.slice(0, 300)
            });
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news', message: error.message });
    }
}