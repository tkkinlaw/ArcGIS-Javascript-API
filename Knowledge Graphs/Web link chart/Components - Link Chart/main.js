require([
    "esri/WebLinkChart",
    "esri/views/LinkChartView",
    "esri/rest/knowledgeGraphService",
    "esri/layers/LinkChartLayer",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
    "esri/widgets/LayerList",
], (WebLinkChart, LinkChartView, KnowledgeGraphService, LinkChartLayer, PopupTemplate, Legend, LayerList) => {

    const url = "https://adsrv2019.ad.local/server/rest/services/Hosted/SupplyChain_finished/KnowledgeGraphServer";
    const linkChart = new WebLinkChart({
        basemap: "gray-vector"
    });

    const view = new LinkChartView({
        container: "viewDiv",
        map: linkChart
    });

    view.ui.add(new Legend({ view: view }), "bottom-left");
    view.ui.add(new LayerList({ view: view }), "top-right");

    const initializeLayer = async () => {

        const knowledgeGraph = await KnowledgeGraphService.fetchKnowledgeGraph(url);

        const results = await KnowledgeGraphService.executeQuery(knowledgeGraph, {
            openCypherQuery: `MATCH path=()-[]-() RETURN path`
        });

        let members = new Map();
        let memberslist = new Map();
        for (const result of results.resultRows) {
            for (const index in result[0].path) {
                const record = result[0].path[index];
                if (!memberslist.has(record.typeName)) {
                    memberslist.set(record.typeName, { useAllData: false, members: new Map() });
                }
                memberslist.get(record.typeName).members.set(record.id, { id: record.id });
            }
        }

        const inclusionDef = {
            generateAllSublayers: false,
            namedTypeDefinitions: memberslist
        };

        const lcLayer = new LinkChartLayer({
            url: url,
            initializationInclusionModeDefinition: inclusionDef //optional
        });

        await lcLayer.load();
        lcLayer.layers.forEach((sublayer) => {
            sublayer.popupTemplate = sublayer.createPopupTemplate();
        });

        linkChart.add(lcLayer);

        view.when(async () => {
            await view.goTo(view.map.diagramNodesExtent);
        });
    };
    initializeLayer();
})