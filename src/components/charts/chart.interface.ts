export interface IChart {
    type: string;
    data: IChartData;
    options: IChartOptions;
    plugins: Array<any>;
}

export interface IChartData {
    labels: Array<string>;
    datasets: Array<IChartDataset>
}

export interface IChartDataset {
    label: string,
    data: Array<number>,
    backgroundColor: Array<string>; //'rgba(255,99,132,1)' || 'red'
    hoverBackgroundColor:  Array<string>;
    borderColor: Array<string>; //'rgba(255,99,132,1)' || 'red'
    borderWidth: number;
}

export interface IChartOptions {
    title: IChartTitle,
    responsive: boolean;
    maintainAspectRatio: boolean;
    scales: any;
    layout: any;
    pieceLabel: any;
    legend: IChartLegend;
    legendCallback: any; // custom legend
    annotation: any;
}

export interface IChartDefaults {
    defaultFontColor: string; // Default font color for all text
    defaultFontFamily: string; // Default font family for all text.
    defaultFontSize: number; // Default font size (in px) for text. Does not apply to radialLinear scale point labels.
    defaultFontStyle: string; // Default font style. Does not apply to tooltip title or footer. Does not apply to chart title.

    layout: any; // {padding: {left: 50,right: 0,top: 0,bottom: 0}}

    title: IChartTitle;
}

export interface IChartTitle {
    display: boolean; //	false	is the title shown
    position: string; //	'top'	Position of title. more...
    fontSize: number; //	12	Font size
    fontFamily: string; //	"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"	Font family for the title text.
    fontColor: string; //	'#666'	Font color
    fontStyle: string; //	'bold'	Font style
    padding: number; //	10 Number of pixels to add above and below the title text.
    lineHeight: number; //	1.2	Height of an individual line of text (see MDN)
    text: string; // /String[] Title text to display. If specified as an array, text is rendered on multiple lines.
}
export interface IChartLegendItem {
    // Label that will be displayed
    text: string,

    // Fill style of the legend box
    fillStyle: string,

    // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
    hidden: boolean,

    // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
    lineCap: string,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
    lineDash: Array<number>,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    lineDashOffset: Number,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
    lineJoin: string,

    // Width of box border
    lineWidth: number,

    // Stroke style of the legend box
    strokeStyle: string

    // Point style of the legend box (only used if usePointStyle is true)
    pointStyle: string
}

export interface IChartLegend {
    display: boolean;
    lables: IChartLegendLabel;
    position: string; //'top'||'bottom'||'left'||'right'	Position of the legend. more...
    fullWidth: boolean; // Marks that this box should take the full width of the canvas (pushing down other boxes). This is unlikely to need to be changed in day-to-day use.
    onClick: any; // A callback that is called when a click event is registered on a label item
    onHover: any; // A callback that is called when a 'mousemove' event is registered on top of a label item
    reverse: boolean;
}

export interface IChartLegendLabel{
    boxWidth: number; //	40	width of coloured box
    fontSize: number; //	12	font size of text
    fontStyle: string; //	'normal'	font style of text
    fontColor: string; //	'#666'	Color of text
    fontFamily: string; //	"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"	Font family of legend text.
    padding: number; //	10	Padding between rows of colored boxes.
    generateLabels: any; //		Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See Legend Item for details.
    filter: any;//	null	Filters legend items out of the legend. Receives 2 parameters, a Legend Item and the chart data.
    usePointStyle: boolean; //	false	Label style will match corresponding point style (size is based on fontSize, boxWidth is not used in this case).
}