require([
    "esri/WebLinkChart",
    "esri/views/LinkChartView",
    "esri/rest/knowledgeGraphService",
    "esri/layers/LinkChartLayer",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
    "esri/widgets/LayerList",
], (WebLinkChart, LinkChartView, KnowledgeGraphService, LinkChartLayer, PopupTemplate, Legend, LayerList) => {

    //url to knowledge graph service
    const url =
        "https://adsrv2019.ad.local/server/rest/services/Hosted/SupplyChain_finished/KnowledgeGraphServer";
    //initialize link chart canvas and link chart view
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
        // fetch the knowledge graph
        const knowledgeGraph = await KnowledgeGraphService.fetchKnowledgeGraph(url);
        //query the knowledge graph to get only the research grade observations and the users who made and reviewed those observations

        const results = await KnowledgeGraphService.executeQuery(knowledgeGraph, {
            openCypherQuery: `MATCH path=()-[]-() RETURN path`
        });
        //create a js map object of the ids and entity and relationship types from the records returned
        //from the query to include in the layer.
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

        //only create a sublayer for the specified named types.
        const inclusionDef = {
            generateAllSublayers: false,
            namedTypeDefinitions: memberslist
        };

        //create the layer
        //the initializationInclusionModeDefinition is an optional constructor property. If excluded, all records in the graph will be included and
        //an inclusionModeDefinition defined from all records in the graph at the time of layer creation.-
        const lcLayer = new LinkChartLayer({
            url: url,
            initializationInclusionModeDefinition: inclusionDef //optional
        });
        //Once the layer has loaded, you can enable popups or change the configuration of a specific sublayer.
        //This is optional
        await lcLayer.load();
        lcLayer.layers.forEach((sublayer) => {
            sublayer.popupTemplate = sublayer.createPopupTemplate();
        });
        //add layer to link chart
        linkChart.add(lcLayer);
        //zoom to link chart extent
        view.when(async () => {
            await view.goTo(view.map.diagramNodesExtent);
        });
    };
    initializeLayer();

})