const { Customer, enums, GoogleAdsApi, ResourceNames, services } = require('google-ads-api')


class GoogleAdService {
    /** @type {Customer} */
    customer = null;

    /** @type {number} */
    customerId = null

    constructor() {
        const client = new GoogleAdsApi({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            developer_token: process.env.DEVELOPER_TOKEN,
        })
        this.customer = client.Customer({
            customer_id: process.env.CUSTOMER_ID,
            login_customer_id: process.env.LOGIN_CUSTOMER_ID,
            refresh_token: process.env.REFRESH_TOKEN,
        })
        this.customerId = process.env.CUSTOMER_ID
    }

    async createResources() {
        const keywordPlanId = await this.createKeywordPlan(this.customer)
        const keywordPlanCampaignId = await this.createKeywordPlanCampaign(this.customer, keywordPlanId)
        await this.createKeywordPlanAdGroup(this.customer, keywordPlanCampaignId)

        return keywordPlanId
    }

    async getKeywordPlanList() {
        return await this.customer.query(`SELECT keyword_plan.id, keyword_plan.name FROM keyword_plan`)
            .then(result => result.map((item) => item.keyword_plan))
    }

    async getKeywordPlan(keywordPlanId) {
        const keywordPlanResource = ResourceNames.keywordPlan(this.customerId, keywordPlanId)
        return await this.customer.keywordPlans.get(keywordPlanResource)
    }

    async deleteKeywordPlan(keywordPlanId) {
        const keywordPlanResource = ResourceNames.keywordPlan(this.customerId, keywordPlanId)
        return await this.customer.keywordPlans.remove([keywordPlanResource])
    }

    async addKeywords(keywordPlanId, keywords) {
        const result = await this.customer.query(
            `SELECT keyword_plan_ad_group.id 
            FROM keyword_plan_ad_group 
            WHERE keyword_plan.id = ${keywordPlanId} LIMIT 1`
        ).then(result => result[0] || null)

        const keywordPlanAdGroup = result.keyword_plan_ad_group
        const keywordPlanAdGroupId = keywordPlanAdGroup.id

        return await this.createKeywordPlanAdGroupKeywords(this.customer, keywordPlanAdGroupId, keywords)
    }

    async generateHistoricalMetrics(keywordPlanId) {
        const keywordPlanResource = ResourceNames.keywordPlan(this.customerId, keywordPlanId)
        const generateHistoricalMetricsRequest = services.GenerateHistoricalMetricsRequest.create({
            keyword_plan: keywordPlanResource,
        })

        return await this.customer.keywordPlans.generateHistoricalMetrics(generateHistoricalMetricsRequest)
    }

    async createKeywordPlan(customer) {
        const keywordPlan = {
            name: '[googleAdsMetricsApi] Keyword plan #' + Date.now(),
            forecast_period: { date_interval: enums.KeywordPlanForecastInterval.NEXT_MONTH },
        }

        const response = await customer.keywordPlans.create([keywordPlan])
        const keywordPlanResource = response.results[0].resource_name
        const keywordPlanId = keywordPlanResource.split('/').pop()
        return keywordPlanId
    }

    async createKeywordPlanCampaign(customer, keywordPlanId) {
        const keywordPlanResource = ResourceNames.keywordPlan(this.customerId, keywordPlanId)
        const keywordPlanCampaign = {
            cpc_bid_micros: 1000000,
            name: '[googleAdsMetricsApi] Keyword plan campaign #' + Date.now(),
            keyword_plan: keywordPlanResource,
            keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
            geo_targets: [{ geo_target_constant: ResourceNames.geoTargetConstant(2804) }],
        }

        const response = await customer.keywordPlanCampaigns.create([keywordPlanCampaign])
        const keywordPlanCampaignResource = response.results[0].resource_name
        const keywordPlanCampaignId = keywordPlanCampaignResource.split('/').pop()
        return keywordPlanCampaignId
    }

    async createKeywordPlanAdGroup(customer, keywordPlanCampaignId) {
        const keywordPlanCampaignResource = ResourceNames.keywordPlanCampaign(this.customerId, keywordPlanCampaignId)
        const keywordPlanAdGroup = {
            name: '[googleAdsMetricsApi] Keyword plan ad group #' + Date.now(),
            cpc_bid_micros: 2500000,
            keyword_plan_campaign: keywordPlanCampaignResource,
        }

        const response = await customer.keywordPlanAdGroups.create([keywordPlanAdGroup])
        const keywordPlanAdGroupResource = response.results[0].resource_name
        const keywordPlanAdGroupId = keywordPlanAdGroupResource.split('/').pop()
        return keywordPlanAdGroupId
    }

    /**
     * 
     * @param {Customer} customer 
     * @param {number} keywordPlanAdGroupId 
     * @param {Array<string>} keywords 
     */
    async createKeywordPlanAdGroupKeywords(customer, keywordPlanAdGroupId, keywords) {
        const keywordPlanAdGroupResource = ResourceNames.keywordPlanAdGroup(this.customerId, keywordPlanAdGroupId)
        const keywordPlanKeyword = keywords.map((keyword) => ({
            text: keyword,
            cpc_bid_micros: 1990000,
            match_type: enums.KeywordMatchType.BROAD,
            keyword_plan_ad_group: keywordPlanAdGroupResource,
        }))

        // Passing in a single entity to create
        return await customer.keywordPlanAdGroupKeywords.create(keywordPlanKeyword).catch(console.error)
    }
}

module.exports = GoogleAdService;
