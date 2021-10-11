const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
if (process.env.APP_HOST) {
    swaggerDocument.host = process.env.APP_HOST
}

const GoogleAdService = require('./googleAdsService')
const googleAdService = new GoogleAdService()

const port = 8080
app.use(express.json());
app.use((req, res, next) => {
    if (req.path.includes('/keywordPlan')) {
        console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.path}`);
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument));
//
app.get('/keywordPlan', async (req, res) => {
    try {
        const result = await googleAdService.getKeywordPlanList()
        return res.send(result)
    } catch (error) {
        console.error(error)
        return res.status(401).send(error)
    }
})

//
app.post('/keywordPlan', async (req, res) => {
    try {
        const keywordPlanId = await googleAdService.createResources()
        return res.send({ id: keywordPlanId })
    } catch (error) {
        console.error(error)
        return res.status(401).send(error)
    }
})

// 339702476
app.get('/keywordPlan/:id', async (req, res) => {
    const { id: keywordPlanId } = req.params
    try {
        const result = await googleAdService.getKeywordPlan(keywordPlanId)
        return res.send(result)
    } catch (error) {
        console.error(error)
        return res.status(404).send('Resource not found.')
    }
})

//
app.delete('/keywordPlan/:id', async (req, res) => {
    const { id: keywordPlanId } = req.params
    try {
        const result = await googleAdService.deleteKeywordPlan(keywordPlanId)
        return res.send(result)
    } catch (error) {
        console.error(error)
        return res.status(404).send('Resource not found.')
    }
})

app.post('/keywordPlan/:id/keywords', async (req, res) => {
    const { id: keywordPlanId } = req.params
    try {
        const result = await googleAdService.addKeywords(keywordPlanId, req.body)
        return res.send(result)
    } catch (error) {
        console.error(error)
        return res.status(404).send('Resource not found.')
    }
})

//
app.get('/keywordPlan/:id/historicalMetrics', async (req, res) => {
    const { id: keywordPlanId } = req.params
    try {
        const result = await googleAdService.generateHistoricalMetrics(keywordPlanId)
        return res.send(result)
    } catch (error) {
        console.error(error)
        return res.status(404).send('Resource not found.')
    }
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
    console.log("DEVELOPER_TOKEN:", process.env.DEVELOPER_TOKEN)
    console.log("CLIENT_ID:", process.env.CLIENT_ID)
    console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET)
    console.log("REFRESH_TOKEN:", process.env.REFRESH_TOKEN)
    console.log("LOGIN_CUSTOMER_ID:", process.env.LOGIN_CUSTOMER_ID)
    console.log("CUSTOMER_ID:", process.env.CUSTOMER_ID)
})