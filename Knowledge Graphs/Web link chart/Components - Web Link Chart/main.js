require([
  "esri/WebLinkChart",
  "esri/views/LinkChartView",
  "esri/layers/LinkChartLayer"
], function(WebLinkChart, LinkChartView, LinkChartLayer) {
  // Create a WebLinkChart instance
  const myLinkChart = new WebLinkChart({
    portalItem: { // autocasts as new PortalItem()
      id: "e691172598f04ea8881cd2a4adaa45ba"
    }
  });

  // Create a LinkChartView instance and reference the WebLinkChart instance
  const view = new LinkChartView({
    map: myLinkChart,
    container: 'viewDiv'
  });
});