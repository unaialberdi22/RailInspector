
import React, { useState } from "react";
import { Row, Col, Select, Button, DatePicker, Empty, Radio, Input, Alert, notification, Spin, Tooltip, Space, Divider, Card } from "antd";
import moment from "moment";
import { SyncOutlined, LoadingOutlined, CaretRightOutlined, FastBackwardOutlined, FastForwardOutlined, BorderOutlined, FieldTimeOutlined, RollbackOutlined, PauseOutlined, BackwardOutlined, ForwardOutlined, DeleteOutlined, SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import { map_options } from "variables/global.js";
import TablaAnalisys from "components/Analisys/Tabla.jsx";
import LineChart from "components/Analisys/LineChart.jsx";
import Box from "components/Analisys/Box.jsx";
import Heatmap from "components/Draws/Heatmap.jsx";
import SvgPosition from "components/Svg/SvgPosition.jsx";
import SvgIndex from "components/Svg/SvgIndex.jsx";
import axios from "axios";
//import { openNotificationWithIcon } from '../../components/MyNotifications';
import { colors } from "variables/global.js";
import CanvasDraw from "react-canvas-draw";
import { CSVLink } from "react-csv";
import AreasRes from "../../components/Res/AreasRes.jsx";
import { openNotificationDanger } from "../../components/MyNotifications/index.js";
//import Leaflet from "components/Res/AreasRes.jsx";
let tagSize = "40";
let aux = null;


setInterval(() => {
  let tags = localStorage.getItem("tagsSelected");
  if (tags && tags.length > 0) {
    axios.get(process.env.REACT_APP_API + "activated_alarm")
      .then(res => {
        if (res.data && res.status == 200) {
          if (document.getElementById("showDanger")) document.getElementById("showDanger").style.display = res.data.deletedAlarms === true ? "block" : "none";
        } else {
          if (document.getElementById("showDanger")) document.getElementById("showDanger").style.display = "none";
        }
      });
  }
}, 500)



function handleChangeTagSize() {
  let size = document.getElementById("selectTagSize").value;
  if (size) {
    tagSize = size.toString();
  }
}

const { RangePicker } = DatePicker;
const openNotificationWithIcon = (type, title, description) => {
  notification[type]({
    message: title,
    description: description,
    duration: 3
  });
};

function getRanges() {
  return {
    "Este mes": [moment().startOf("month"), moment().endOf("month")],
    "Esta semana": [moment().startOf("week"), moment().endOf("week")],
    Ayer: [
      moment()
        .set({ hour: 0, minute: 0, second: 0 })
        .add(-1, "day"),
      moment()
        .set({ hour: 23, minute: 59, second: 59 })
        .add(-1, "day")
    ],
    "Últimas 24 horas": [moment().subtract(24, "h"), moment()],
    "Últimas 12 horas": [moment().subtract(12, "h"), moment()],
    "Últimas 6 horas": [moment().subtract(6, "h"), moment()],
    "Últimas 3 horas": [moment().subtract(3, "h"), moment()],
    "Última hora": [moment().subtract(1, "h"), moment()],
    "Últimos 30 minutos": [moment().subtract(30, "minutes"), moment()],
    "Últimos 15 minutos": [moment().subtract(15, "minutes"), moment()],
    "Últimos 5 minutos": [moment().subtract(5, "minutes"), moment()]
  };
}

export default function Analisys() {
  const[loading, setLoading] = useState(false)
  const[stages, setStages] = useState(null)
  const[stageSelected, setStagesSelected] = useState(null)
  const[tags, setTags] = useState(null)
  const[tagsSelected, setTagsSelected] = useState(getStorageTags("tagsSelected") || null)
  const[tagForRoute, setTagForRoute] = useState(null)
  const[map_options, setMap_options] = useState(map_options.select)
  const[map_option, setMap_option] = useState(localStorage.getItem("map_option") || "heatmap")
  const[selectedDate, setSelectedDate] = useState(getStorageTags("selectedDate") || [moment().subtract(1, "h"), moment()])

  const[lineChartData, setLineChartData] = /*data2 || */useState([])
  const[lineChartNivo, setLineChartNivo] = /*data2 || */useState([])
  const[barChartData, setBarChartData] = /*barChartData ,*/useState({ datasets: [] })
  const[srcStage, setSrcStage] = useState("")
  const[brushSize, setBrushSize] = useState(5)
  const[tagSpeed, setTagSpeed] = useState(100)
  const[tagRouteName, setTagRouteName] = useState("")
  const[stageWidth, setStageWidth] = useState(830)
  const[stageHeight, setStageHeight] = useState(985)
  const[tableData, setTableData] = useState([])

  const[zoomLevel, setZoomLevel] = useState(0.4)
  const[alarmsFilter, setAlarmsFilter] = useState([])

  const[rangesTime, setRangesTime] = useState(getRanges())
  const[intervalId, setIntervalId] = useState(null)
  const[heatmap, setHeatmap] = useState([])
  const[svgData, setSvgData] = useState([])
  const[allData, setAllData] = useState([])
  const[elements, setElements] = useState([])

  const[distance_global, setDistance_global] = useState(0)
  const[time_global, setTime_global] = useState(0)
  const[time_stop_global, setTime_stop_global] = useState(0)
  const[time_move_global, setTime_move_global] = useState(0)

  const[columsExtra, setColumsExtra] = useState([])

  const[svgImg, setSvgImg] = useState("")
  const[svgHeight, setSvgHeight] = useState(0)
  const[svgWidth, setSvgWidth] = useState(0)

  const[csvData, setCsvData] = useState([])

  const[shape, setShape] = useState(0)
  const[areas, setAreas] = useState(<div></div>)
  const[areasPos, setAreasPos] = useState(<div></div>)
  const[newAreas, setNewAreas] = useState(<div></div>)
  const[numAreas, setNumAreas] = useState(0)
  const[first, setFirst] = useState(0)

  const[tableAlarms, setTableAlarms] = useState([])

  const[chartDataSpeed, setChartDataSpeed] = useState(1000)
  const[play, setPlay] = useState(true)
  const[selectedDateForClick, setSelectedDateForClick] = useState([moment().subtract(1, "h"), moment()])
  const[intervalChart, setIntervalChart] = useState(null)
  const[actualChartDate, setActualChartDate] = useState(localStorage.getItem("selectedDate") ? moment(new Date(JSON.parse(localStorage.getItem("selectedDate"))[0])).format('YYYY-MM-DDTHH:mm:ss.sssZ').toString() : moment(new Date()).subtract(1, "h").format('YYYY-MM-DDTHH:mm:ss.sssZ').toString())
  const[playChartDate, setPlayChartDate] = useState(localStorage.getItem("selectedDate") ? moment(new Date(JSON.parse(localStorage.getItem("selectedDate"))[0])) : moment(new Date()).subtract(1, "h"))
  const[intervalTimers, setIntervalTimers] = useState([
    {
      name: 'Cada segundo',
      value: 'seconds'
    },
    {
      name: 'Cada minuto',
      value: 'minutes'
    },
    {
      name: 'Cada hora',
      value: 'hours'
    }
  ])
  const[intervalTime, setIntervalTime] = useState('seconds')

  const playChart = () => {
    var myPlot = document.getElementById('DivChart');
    var fecha = playChartDate;
    var fechaFinal = selectedDate[1];
    var fechaParseada = 0;
    var fechaActual = 0;
    var i = 0;

    if (play == true) {

      intervalChart = setInterval(() => {

        if (map_option != "pos_for_time") {

          resetInterval()
        }

        if (fecha.isSameOrAfter(fechaFinal, 'second') || playChartDate.isBefore(moment(new Date(JSON.parse(localStorage.getItem("selectedDate"))[0])), 'second')) {

          openNotificationWithIcon('error', 'La fecha actual', 'La fecha no esta en el grafico')

          resetInterval()

        } else {

          if (myPlot && myPlot.data) {
            for (let j = 0; j < myPlot.data.length; j++) {

              fechaParseada = fecha.format('YYYY-MM-DDTHH:mm:ss')
              fechaActual = myPlot.data[j].x.find(item => item.includes(fechaParseada))

              if (fechaActual == undefined) {
                setPlayChartDate(fecha)
                setActualChartDate(actualChartDate(fecha.format('YYYY-MM-DDTHH:mm:ss.sssZ').toString()))
              } else {

                i = myPlot.data[j].x.indexOf(fechaActual);

                Plotly.Fx.hover("DivChart", [{ curveNumber: j, pointNumber: i }]);
                setPlayChartDate(fecha)
                setActualChartDate(fechaActual)

                let date = myPlot.data[j].x[i] || null;
                if (date) onChangeHoverChart(date);
              }
              if (j == myPlot.data.length - 1) {

                fecha = fecha.add(1, intervalTime);
              }
            }
          }
        }
      }, chartDataSpeed);
      setPlay(false);
    } else {
      clearInterval(intervalChart);
      setPlay(true);
    }
  }
  const resetInterval = () => {
    if (play == false) {
      playChart()
    }
    setPlayChartDate(moment(new Date(JSON.parse(localStorage.getItem("selectedDate"))[0])))
  }
  const slowerChart = () => {
    if (play == false) playChart();
    if (chartDataSpeed >= 5000) {
      openNotificationWithIcon('error', 'Mínimo Tiempo', 'Se ha alcanzado el máximo tiempo entre datos')
    } else {
      chartDataSpeed = chartDataSpeed + 500;
      openNotificationWithIcon('info', 'Velocidad Bajada', 'Se ha aumentado en tiempo entre datos a ' + chartDataSpeed + ' milisegundos')
    }
  }
  const fasterChart = () => {
    if (play == false) playChart();
    if (chartDataSpeed <= 0) {
      openNotificationWithIcon('error', 'Máximo Tiempo', 'Se ha alcanzado el mínimo tiempo entre datos')
    } else {
      chartDataSpeed = chartDataSpeed - 500;
      openNotificationWithIcon('info', 'Velocidad Subida', 'Se ha disminuido el tiempo entre datos a ' + chartDataSpeed + ' milisegundos')
    }
  }
  const plus30min = () => {
    setPlayChartDate(playChartDate.add(30, 'minutes'));
  }
  const minus30min = () => {
    setPlayChartDate(playChartDate.add(-30, 'minutes'));
  }
  const getStorageTags = (name) => {
    try {
      if (name == "selectedDate") {
        var fechas = JSON.parse(localStorage.getItem(name));
        return [moment(new Date(fechas[0])), moment(new Date(fechas[1]))];
      }
      return JSON.parse(localStorage.getItem(name));
    } catch (objError) {
      return null;
    }
  }

  const filterAlarms = (alarm) => {
    const alarms = alarm
    const startDate = moment(JSON.parse(localStorage.getItem("selectedDate"))[0]).format('YYYY-MM-DDTHH:mm:ss')
    const endDate = moment(JSON.parse(localStorage.getItem("selectedDate"))[1]).format('YYYY-MM-DDTHH:mm:ss')
    const filterAlarms = alarms.filter(item =>
      moment(item.datetime).isBetween(startDate, endDate)
    )
    setAlarmsFilter(filterAlarms)
  }

  const componentDidMount = () => {
    window.addEventListener('wheel', handleZoom, { passive: false });
    var interval = setInterval(refreshRanges.bind(this), 60000);
    // no se
    this.setState({ interval });
    getAlarms();

    axios.get(process.env.REACT_APP_API + "stages").then(res => {
      if (res.data.status && res.data.status == 200) {
        setStages(res.data.stages)
        let localStage = localStorage.getItem("stageSelected");
        if (localStage) {
          onChange(localStage, "stageSelected");
        } else {
          onChange(res.data.stages[0].id_stage, "stageSelected");
        }
        changeTags();
      }
    });
  }

  useEffect(()=>{changeTags},[stageSelected])

  const componentWillUnmount = () => {
    // use intervalId fromto clear the interval
    clearInterval(intervalId);
    window.removeEventListener('wheel', handleZoom);
  }

  const refreshRanges = () => {
    setRangesTime(getRanges())
  }

  async function onChange(val, name) {
    //Cambio para svg positioon
    if (name == "stageSelected") {
      var objStage = stages.find(item => item.id_stage == val);
      //console.log(process.env.REACT_APP_API + "image/"+objStage.img_src);
      // this.getWidth(process.env.REACT_APP_API + "image/"+objStage.img_src);
      // this.getHeight(process.env.REACT_APP_API + "image/"+objStage.img_src);
      let pixels = await getMeta(process.env.REACT_APP_API + "image/" + objStage.img_src);

      setSvgImg(objStage.img_src)
      setSvgHeight(objStage.height)
      setSvgWidth(objStage.width)
      setStageWidth(parseInt((pixels.w * 700) / pixels.h))
      setStageHeight(700)

      this.setState({
        [name]: val,
      });

    }
    this.setState({ [name]: val });
    if (Array.isArray(val)) localStorage.setItem(name, JSON.stringify(val));
    else localStorage.setItem(name, val);

    // if(first>2 && (map_option== "pos_for_time" || map_option=="create_area")){window.location.reload()}
    // this.setState({ first:first+1 });
  }


  //dudassss 
  const getMeta = (url) => {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => resolve({ w: img.width, h: img.height })
      img.onerror = reject
      img.src = url
    })

  }


  const onChangeTagRoute = (val) => {
    setTagForRoute(val)
    let tag = tags.filter((item, i) => (parseInt(item.id_tag) == parseInt(val)));
    setTagRouteName(tag[0].name)
  }

  // es 1/1
  const onChangeBrushSize = (val) => {
    setBrushSize(val)
  }

  const onChangeSpeed = (val) => {
    setTagSpeed(val)
  }

  // es 1/1
  const onChangeShape = (val) => { 
    setShape(val)
  }

  // no estoy seguro
  const onChangeRadio = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    localStorage.setItem(e.target.name, e.target.value);
    if (e.target.value == "pos_for_time") {
      window.location.reload()
    }
  };

  const onChangeDate = (dates) => {
    setActualChartDate(moment(new Date(dates[0])).format('YYYY-MM-DDTHH:mm:ss.sssZ').toString())
    setPlayChartDate(moment(new Date(dates[0])))
    setSelectedDateForClick(dates)
    localStorage.setItem("selectedDate", JSON.stringify(dates));
    findNewData(dates, tagsSelected);
  }

  const onClickRefresh = () => {
    if (localStorage.getItem("selectedDate")) {
      //this.updateContent(this.getStorageTags("selectedDate"),tagsSelected);
      findNewData(getStorageTags("selectedDate"), tagsSelected);
    } else {
      localStorage.setItem("selectedDate", JSON.stringify(selectedDateForClick))
      findNewData(getStorageTags("selectedDate"), tagsSelected);
    }
  }
  
  //que pasa aqui 
  //actualizar datos cada 5 minutos
  const updateContent = (dates, tags) => {
    findNewData(getStorageTags("selectedDate"), tagsSelected);
    if (aux) { clearInterval(aux) }
    aux = setInterval(() => findNewData([moment(new Date()).subtract(3, "hours"), moment(new Date())], tagsSelected), 120000);
  };

  const findNewData = (dates, tags) => {
    getAlarms();
    getAreas();
    if (loading) return;
    setLoading(true);
    axios
      .post(process.env.REACT_APP_API + "analisys2", {
        tags: tags,
        dates: [dates[0].format(), dates[1].format()],
        stage: stageSelected
      })
      .then(res => {
        if (res.data.status && res.data.status == 200) {
          let n_datos = res.data.data.length + res.data.heatmap.length + res.data.svg.length + res.data.table.length;

          res.data.all.map(obj => {
            let newObj = {};
            obj.tag_pos.forEach(element => {
              newObj[moment(element.datetime).format("YYYY-MM-DDTHH:mm:ssZ")] = element;
            });
            obj.new_tag_pos = newObj;
          });

          if (n_datos > 0) {

            setAllData(res.data.all)
            setHeatmap(res.data.heatmap)
            setTableData(res.data.table)
            setSvgData(res.data.svg)
            setColumsExtra(res.data.columsExtra)
            setDistance_global(res.data.table[0].distance.toFixed(2) || 0)
            setTime_global(res.data.table[0].time_total || 0)
            setTime_stop_global(res.data.table[0].time_stopped || 0)
            setTime_move_global(res.data.table[0].time_moving || 0)

            setDistanceChartData(res.data.data);
          } else {

            setAllData([])
            setHeatmap([])
            setTableData([])
            setSvgData([])
            setColumsExtra([])
            setDistance_global(0)
            setTime_global(0)
            setTime_stop_global(0)
            setTime_move_global(0)

            setDistanceChartData(res.data.data);

            openNotificationWithIcon("warning", "No hay datos", "No hay datos para las especificaciones solicitadas.");
          }

          //Si tuvieramos que filtrar los negativos
          /*
            let heat = res.data.heatmap.filter(row => row.x >= 0 && row.x <= 100 && row.y >= 0 && row.y <= 100);
            if (res.data.heatmap) this.setState({ heatmap: heat, tableData: res.data.table, svgData: res.data.svg });
            else this.setState({ heatmap: [], tableData: [], svgData: [] });
          */
        }
      })
      .catch(() => openNotificationWithIcon("warning", "No hay datos", "No hay datos para las especificaciones solicitadas."))
      .finally(() => {
        setLoading(false);
      });

    axios
      .post(process.env.REACT_APP_API + "getTagPos", {
        dates: [dates[0].format(), dates[1].format()],
        // tag : localStorage.getItem("tagsSelected")[1]
      })
      .then(res => {
        if (res.data.status && res.data.status == 200) {
          let csv = res.data.tags ? res.data.tags : [];
          csv.map(obj => parseInt(obj.msg_type) == 1 ? obj.msg_type = "Drawed" : obj.msg_type = "Real");
          csv.map(obj => obj.x = parseFloat(obj.x).toFixed(3));
          setCsvData( res.data.tags ? csv : [])
        } else {
          openNotificationWithIcon("warning", "No hay datos", "No hay datos para las especificaciones solicitadas.");
        }
      })
      .catch(() => openNotificationWithIcon("warning", "No hay datos", "No hay datos para las especificaciones solicitadas."))

  }

  const changeTags = () => {
    let obj = stages.find(item => item.id_stage == stageSelected);
    if (obj) setTags(obj.tag_refs);

    if (!obj || obj.tag_refs.length == 0) {
      onChange(undefined, "tagsSelected");
    } else if (obj.tag_refs && obj.tag_refs.length > 0) {
      onChange([obj.tag_refs[0].id_tag], "tagsSelected");
    }

    if (obj && obj.tag_refs[0])
      findNewData(selectedDate, [obj.tag_refs[0].id_tag]);
  }

  const onChangeHoverChart = (date) => {
    let fecha = moment(date).format("YYYY-MM-DDTHH:mm:ssZ")
    let svgData = getTags2plot(allData, fecha);
    // no se
    this.setState({ svgData });
  }

  const getTags2plot = (arr, date) => {
    let arrTags = [];

    arr.map(el => {
      if (el.tag_pos.length > 0) {
        var objStage = el.stage;
        let height = objStage.height;
        let width = objStage.width;

        //let objFinded = el.tag_pos.find(el => moment(el.datetime).format("YYYY-MM-DDTHH:mm:ssZ") == date)
        let objFinded = el.new_tag_pos[date];
        if (objFinded) {
          const actualPlayedDate = playChartDate.format('YYYY-MM-DDTHH:mm:ss')
          const alarmFilter = alarmsFilter
          let isAlert = alarmFilter.find(item => {
            let startDate = moment(item.datetime).format('YYYY-MM-DDTHH:mm:ss')
            let endDate = item.stoped ? moment(item.stoped).format('YYYY-MM-DDTHH:mm:ss') : moment().format('YYYY-MM-DDTHH:mm:ss')
            return moment(actualPlayedDate).isBetween(startDate, endDate) || objFinded.inRestrictedZone ? true : false
          })

          arrTags.push({
            id_tag: el.id_tag,
            img: isAlert ? el.img_alert : el.img_src,
            x: (objFinded.x * 100) / width,
            y: ((height - objFinded.y) * 100) / height,
            z: objFinded.z,
            hpl: objFinded.hpl,
            name: el.name,
            datetime: objFinded.datetime,
            inRestrictedZone: objFinded.inRestrictedZone
          });
        }
      }
    });
    return arrTags;
  }

  const setDistanceChartData = (datos) => {

    let objRows = [];

    datos.forEach((elem, i) => {

      let id = elem.id_tag_fk;

      if (!objRows[id]) {

        objRows[id] = {
          name: tags.find(tag => tag.id_tag === id).name,
          x: [],
          y: [],
          type: 'scatter',
          mode: 'markers',
          marker: { size: 5 },
        };
      }
      objRows[id].x.push(datos[i].datetime);
      objRows[id].y.push(datos[i].distance_acum.toFixed(2));

    });

    let dataChart = [];

    for (let i = 0; i < objRows.length; i++) {

      if (objRows[i]) {
        dataChart.push(objRows[i]);
      }
    }
    setLineChartData(dataChart)
  }

  const setNivoLineChart = (obj) => {
    let objRows = {};
    let distaceChart = {
      id: "",
      color: "rgb(145, 0, 75)",
      data: []
    };

    obj.map((elem, i) => {
      let id = elem.id_tag_fk;

      if (!objRows[id]) {
        objRows[id] = distaceChart;
        objRows[id].id = tags.find(tag => tag.id_tag === id).name;
      }

      objRows[id].data.push({ x: moment(obj[i].datetime), y: obj[i].distance_acum });
    });

    let dataChart = Object.values(objRows);

    setLineChartNivo(dataChart)
  }

  const getWidth = (url) => {
    var img = new Image();
    img.onload = function () {
      return this.width;
    };
    img.src = url;
    setStageWidth(img.width);
  }

  const getHeight = (url) => {
    var img = new Image();
    img.onload = function () {
      return this.height;
    };
    img.src = url;
    this.setState({ stageHeight: img.heigth });
  }


  const getdistance = (p, q) => {
    var dx = p.x - q.x;
    var dy = p.y - q.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist;
  }

  const importData = () => {
    document.getElementById('btnImport').click();
  }

  const handleFile = (e) => {
    const content = e.target.result;


    // You can set contenand show it in render.
  }

  const handleChangeRectangles = (rects) => {
    this.setState({ rectangles: rects });
  }

  const addArea = (n) => {
    switch (parseInt(n) + 1) {
      case 0:
        this.setState({ newAreas: <div></div> });
        break;
      case 1:
        this.setState({ newAreas: <div><AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight}/*shapeWidth={300} shapeHeight={300} stop={true} shapeX={200} shapeY={300}*/ /></div> });
        break;
      case 2:
        this.setState({
          newAreas: <div>
            <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
            <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} /></div>
        });
        break;
      case 3:
        this.setState({
          newAreas: <div>
            <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
            <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
            <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} /></div>
        });
        break;
      case 4:
        this.setState({
          newAreas:
            <div>
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
            </div>
        });
        break;
      case 5:
        this.setState({
          newAreas:
            <div>
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
            </div>
        });
        break;
      case 6:
        this.setState({
          newAreas:
            <div>
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
              <AreasRes stage={stageSelected} tags={tagsSelected} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
            </div>
        });
        break;
      default:
        openNotificationWithIcon("error", "No se pueden agregar más areas.");
        break;
    }
    this.setState({ numAreas: parseInt(n) + 1 });
  }

  const getAreas = () => {
    let idStage = parseInt(stageSelected);
    axios
      .get(process.env.REACT_APP_API + "areas/" + idStage)
      .then(res => {
        if (res.data.status && res.data.status == 200) {
          let areas = res.data.areas ? res.data.areas : [];
          //console.log(areas);
          switch (parseInt(areas.length)) {
            case 0:
              this.setState({ areas: <div></div> });
              break;
            case 1:
              this.setState({
                areas: <div>
                  <AreasRes idArea={areas[0].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[0].w} shapeHeight={areas[0].h} shapeX={areas[0].x} shapeY={areas[0].y} shapeRadius={areas[0].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                </div>
              });
              break;
            case 2:
              this.setState({
                areas: <div>
                  <AreasRes idArea={areas[0].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[0].w} shapeHeight={areas[0].h} shapeX={areas[0].x} shapeY={areas[0].y} shapeRadius={areas[0].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[1].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[1].w} shapeHeight={areas[1].h} shapeX={areas[1].x} shapeY={areas[1].y} shapeRadius={areas[1].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                </div>
              });
              break;
            case 3:
              this.setState({
                areas: <div>
                  <AreasRes idArea={areas[0].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[0].w} shapeHeight={areas[0].h} shapeX={areas[0].x} shapeY={areas[0].y} shapeRadius={areas[0].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[1].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[1].w} shapeHeight={areas[1].h} shapeX={areas[1].x} shapeY={areas[1].y} shapeRadius={areas[1].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[2].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[2].w} shapeHeight={areas[2].h} shapeX={areas[2].x} shapeY={areas[2].y} shapeRadius={areas[2].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                </div>
              });
              break;
            case 4:
              this.setState({
                areas: <div>
                  <AreasRes idArea={areas[0].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[0].w} shapeHeight={areas[0].h} shapeX={areas[0].x} shapeY={areas[0].y} shapeRadius={areas[0].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[1].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[1].w} shapeHeight={areas[1].h} shapeX={areas[1].x} shapeY={areas[1].y} shapeRadius={areas[1].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[2].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[2].w} shapeHeight={areas[2].h} shapeX={areas[2].x} shapeY={areas[2].y} shapeRadius={areas[2].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[3].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[3].w} shapeHeight={areas[3].h} shapeX={areas[3].x} shapeY={areas[3].y} shapeRadius={areas[3].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                </div>
              });
              break;
            case 5:
              this.setState({
                areas: <div>
                  <AreasRes idArea={areas[0].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[0].w} shapeHeight={areas[0].h} shapeX={areas[0].x} shapeY={areas[0].y} shapeRadius={areas[0].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[1].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[1].w} shapeHeight={areas[1].h} shapeX={areas[1].x} shapeY={areas[1].y} shapeRadius={areas[1].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[2].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[2].w} shapeHeight={areas[2].h} shapeX={areas[2].x} shapeY={areas[2].y} shapeRadius={areas[2].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[3].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[3].w} shapeHeight={areas[3].h} shapeX={areas[3].x} shapeY={areas[3].y} shapeRadius={areas[3].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[4].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[4].w} shapeHeight={areas[4].h} shapeX={areas[4].x} shapeY={areas[4].y} shapeRadius={areas[4].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                </div>
              });
              break;
            case 6:
              this.setState({
                areas: <div>
                  <AreasRes idArea={areas[0].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[0].w} shapeHeight={areas[0].h} shapeX={areas[0].x} shapeY={areas[0].y} shapeRadius={areas[0].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[1].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[1].w} shapeHeight={areas[1].h} shapeX={areas[1].x} shapeY={areas[1].y} shapeRadius={areas[1].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[2].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[2].w} shapeHeight={areas[2].h} shapeX={areas[2].x} shapeY={areas[2].y} shapeRadius={areas[2].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[3].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[3].w} shapeHeight={areas[3].h} shapeX={areas[3].x} shapeY={areas[3].y} shapeRadius={areas[3].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[4].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[4].w} shapeHeight={areas[4].h} shapeX={areas[4].x} shapeY={areas[4].y} shapeRadius={areas[4].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                  <AreasRes idArea={areas[5].id_area} stage={stageSelected} tags={tagsSelected} stop={true} shapeWidth={areas[5].w} shapeHeight={areas[5].h} shapeX={areas[5].x} shapeY={areas[5].y} shapeRadius={areas[5].square ? 0 : 1} canvasWidth={stageWidth} canvasHeight={stageHeight} stageWidth={svgWidth} stageHeight={svgHeight} />
                </div>
              });
              break;
            default:
              break;
          }
        } else {
          openNotificationWithIcon("warning", "No hay datos", "No hay datos para las especificaciones solicitadas.")
        }
      })
      .catch(() => openNotificationWithIcon("warning", "No hay datos", "No hay datos para las especificaciones solicitadas."))
  }

  const handleZoom = (event) => {
    if (event.ctrlKey) {
      event.preventDefault();

      const { deltaY, currentTarget } = event;
      if (currentTarget.id === 'divAreasRes') {
        const zoomDelta = deltaY > 0 ? 0.1 : -0.1; // Incremento o decremento del zoom
        this.setState((prevState) => ({
          zoomLevel: Math.max(0.1, Math.min(1, prevState.zoomLevel + zoomDelta)) // Asegúrate de que el zoom se mantenga dentro del rango de 0.1 a 1
        }));
      }
    }
  };

  const handleChangeFile = (file) => {
    let fileData = new FileReader();
    let data = [];
    fileData.onloadend = this.handleFile;
    fileData.readAsText(file);
    fileData.onload = function (progressEvent) {
      let content = this.result;
      let lines = content.split("\n");
      for (var i = 0; i < lines.length; i++) {
        let row = lines[i].split(";");
        if (i > 0 && row[0] && row[1] && row[2] && row[3] && row[4] && row[5] && row[6] && row[7] && row[8]) {
          let myDate = new Date(row[7].toString());
          let date = myDate.getFullYear() + '-' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' + ('0' + myDate.getDate()).slice(-2) + ' ' + (myDate.getHours() - 1) + ':' + ('0' + (myDate.getMinutes())).slice(-2) + ':' + myDate.getSeconds() + '.' + myDate.getMilliseconds() + " +00:00";
          data.push({
            id_tag_fk: parseInt(row[0].toString()),
            x: parseFloat(row[1].toString()),
            y: parseFloat(row[2].toString()),
            z: parseFloat(row[3].toString()),
            hpl: parseFloat(row[4].toString()),
            vpl: parseFloat(row[5].toString()),
            tag_name: row[6].toString(),
            datetime: date,
            msg_type: row[8].toString() == "Drawed\r" ? 1 : 2,
          });
        }
      }
      //guardar datos
      axios.post(process.env.REACT_APP_API + "tagpos", { message: data })
        .then(response => openNotificationWithIcon('success', 'CSV importado con éxito.'))
        .catch((message) => openNotificationWithIcon('error', 'El CSV no ha sido importado.', 'Comprueba si los datos del CSV son correctos.'))
    };
  }

  const changeAlarms = (alarms) => {
    setTableAlarms(alarms);
    filterAlarms(alarms);
  }

  const getAlarms = () => {
    axios.get(process.env.REACT_APP_API + "tag_alerts")
      .then(res => {
        if (res.data && res.data.status == 200) {
          console.log(res.data)
          changeAlarms(res.data.alarms);
        }
      })
      .catch(() => console.log("no hay alarmas"))
  }


  const render = () => {
    const radioStyle = {
      display: "inline",
      /*height: '30px',*/
      lineHeight: "30px"
    };

    const input = document.getElementById('btnImport');
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      console.log(e.target.result)
    }



    const { rangesTime, svgImg, svgWidth, svgHeight, columsExtra, stages, stageSelected, rectangles, selectedIdArea, stageHeight, stageWidth, tableAlarms } = 
    areasFilter = stages ? stages.find(stage => stage.id_stage === stageSelected) : [];
    const areasSelected = areasFilter ? areasFilter.areas : [];

    //Estructura del CSV
    const headersCSV = [
      { label: 'ID tag', key: 'id_tag_fk' },
      { label: 'X', key: 'x' },
      { label: 'Y', key: 'y' },
      { label: 'Z', key: 'z' },
      { label: 'HPL', key: 'hpl' },
      { label: 'VPL', key: 'vpl' },
      { label: 'Nombre', key: 'tag_name' },
      { label: 'Hora', key: 'datetime' },
      { label: 'Tipo dato', key: 'msg_type' },
    ];

    function getMeta(url, callback) {
      var img = new Image();
      img.src = url;
      img.onload = function () { callback(this.width, this.height); }
    }



    return (
      <div style={{ height: "100%" }}>
        <Spin
          wrapperClassName={"h-100"}
          indicator={<LoadingOutlined />}
          spinning={loading}
          tip="Cargando..."
        // delay={200}
        >
          {/* Row form "Cargar Datos" */}
          <Row style={{ marginTop: 50, display: "flex", textAlign: "center", justifyContent: "center" }}>
            <Col xl={4} ></Col>
            <Col xl={16} md={24} sm={24} >
              <Row style={{ display: "flex", textAlign: "center", justifyContent: "center" }}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Escenario"
                  //className={"full-width"}
                  onChange={val => onChange(val, "stageSelected")}
                  value={stageSelected}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}

                >
                  {stages
                    ? stages.map((item, i) => (
                      <Select.Option key={item.id_stage} value={item.id_stage}>
                        {item.name}
                      </Select.Option>
                    ))
                    : null}
                </Select>
                <Select
                  mode="multiple"
                  showSearch
                  optionFilterProp="children"
                  placeholder="Tags"
                  //className={"full-width"}
                  onChange={val => onChange(val, "tagsSelected")}
                  value={tagsSelected || undefined}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  style={{ marginLeft: 10, minWidth: 50 }}
                >
                  {tags
                    ? tags.map((item, i) => (
                      <Select.Option key={item.id_tag} value={item.id_tag}>
                        {item.name}
                      </Select.Option>
                    ))
                    : null}
                </Select>
                <RangePicker
                  ranges={rangesTime}
                  showTime
                  format="YYYY/MM/DD HH:mm:ss"
                  defaultValue={selectedDate}
                  onChange={dates => onChangeDate(dates)}
                  style={{ maxWidth: 300, marginLeft: 10 }}
                />
                <Button type="primary" icon={<SyncOutlined />} style={{ marginLeft: 10 }} onClick={() => onClickRefresh()}>Cargar datos</Button>
              </Row>
            </Col>
            <Col xl={4}></Col>
          </Row>
          {/* Row Radio Buttons */}
          <Row style={{ marginTop: 20, justifyContent: "center", display: "flex", textAlign: "center" }}>
            <Col xl={4} md={4} sm={24}></Col>
            <Col xl={16} md={16} sm={24}>
              <Radio.Group onChange={onChangeRadio} name="map_option" value={map_option} size="large">
                {tagsSelected && tagsSelected.length > 1
                  ? map_options.map((item, i) => (
                    <Radio style={{ display: (item.name.toString()).localeCompare("Recorrido realizado") == 0 || (item.name.toString()).localeCompare("Trazar Ruta") == 0 ? "none" : "inline", lineHeight: "30px" }} key={item.value} value={item.value}>
                      {item.name}
                    </Radio>
                  ))
                  : map_options.map((item, i) => (
                    <Radio
                      //style={radioStyle}
                      //display={(item.name.toString()).localeCompare("Trazar Ruta")==0 || (item.name.toString()).localeCompare("Area de restricción")==0? true : false}
                      style={{ display: (item.name.toString()).localeCompare("Recorrido realizado") == 0 || (item.name.toString()).localeCompare("Trazar Ruta") == 0 ? "none" : "inline", lineHeight: "30px" }}
                      // checked={(item.name.toString()).localeCompare("Mapa de calor")==0? true : false}
                      key={item.value}
                      value={item.value}>
                      {item.name}
                    </Radio>
                  ))}
              </Radio.Group><br></br>

            </Col>
            <Col xl={4} md={4} sm={24}></Col>
          </Row>
          {/* ROW play/pause */}
          <Row style={{ marginTop: 20, justifyContent: "center", display: map_option == "pos_for_time" ? "flex" : "none", textAlign: "center" }}>
            <Col xl={24} md={24} sm={24}>
              {/* Distancia entre datos */}
              <label>Distancia entre datos:</label>
              <Select
                optionFilterProp="children"
                placeholder="Intervalo tiempo"
                style={{ width: 150, marginRight: 20, marginLeft: 10 }}
                className={"full-width"}
                onChange={val => onChange(val, "intervalTime")}
                value={intervalTime}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {intervalTimers ? intervalTimers.map((item, i) => (
                  <Select.Option key={item.name} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))
                  : null}
              </Select>
              {/* Tamaño del tag */}
              <label>Tamaño del tag: </label><select defaultValue={tagSize} id="selectTagSize" style={{ textAlign: "center", borderRadius: "2px", width: 150, border: "solid lightgray 1px", padding: 5, marginLeft: 10, marginTop: -5 }} onChange={handleChangeTagSize}>
                <option value="30">Small (30px)</option>
                <option value="40">Medium (40px)</option>
                <option value="60">Big (60px)</option>
              </select><br /><br />
              {/* Botones play/pause */}
              <div style={{ marginTop: 40, display: "inline" }}>
                <Tooltip title="-30min">
                  <Button type="default" shape="circle" icon={<FastBackwardOutlined />} onClick={() => minus30min()} />
                </Tooltip>
                <Tooltip title="Slower">
                  <Button type="default" shape="circle" icon={<BackwardOutlined />} onClick={() => slowerChart()} />
                </Tooltip>
                <Tooltip title={play == true ? "Play" : "Pause"}>
                  <Button type="default" shape="circle" icon={play == true ? <CaretRightOutlined /> : <PauseOutlined />} onClick={() => playChart()} />
                </Tooltip>
                <Tooltip title="Stop">
                  <Button type="default" shape="circle" icon={<BorderOutlined />} onClick={() => resetInterval()} />
                </Tooltip>
                <Tooltip title="Faster">
                  <Button type="default" shape="circle" icon={<ForwardOutlined />} onClick={() => fasterChart()} />
                </Tooltip>
                <Tooltip title="+30min">
                  <Button type="default" style={{ marginRight: "10px" }} shape="circle" icon={<FastForwardOutlined />} onClick={() => plus30min()} />
                </Tooltip>
                {/* Fecha a recorrer */}
                <h4 style={{ marginTop: 20, marginLeft: 10, display: "inline" }}> Fecha a recorrer  : {[playChartDate.format('YYYY-MM-DDTHH:mm:ss').replace('T', ' ').toString()]}</h4>
              </div>
            </Col>
          </Row>

          {/* ROW trazar ruta */}
          <Row style={{ marginTop: 20, justifyContent: "center", display: map_option == "create_route" ? "flex" : "none", textAlign: "center" }}>
            <Col xl={24} md={24} sm={24}>
              {/* Distancia entre datos */}
              <label>Trazar ruta para el tag:</label>
              <Select
                //mode="multiple"
                id="selectTagRoute"
                showSearch
                optionFilterProp="children"
                placeholder="Tags"
                //className={"full-width"}
                onChange={val => onChangeTagRoute(val)}
                value={tagForRoute || null}
                //filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ marginLeft: 10, minWidth: 50 }}
              >
                {tags
                  ? tags.map((item, i) => (
                    <Select.Option key={item.id_tag} value={item.id_tag}>
                      {item.name}
                    </Select.Option>
                  ))
                  : null}
              </Select>
              <label style={{ marginLeft: 10 }}>Tamaño del pincel: </label>
              <input
                style={{ width: 50, marginLeft: 10, marginTop: -5, border: "solid lightgray 1px", textAlign: "center", borderRadius: "2px", height: 30 }}
                type="number"
                value={brushSize}
                onChange={e =>
                  setBrushSize(parseInt(e.target.value, 10))
                }
              />
              <label style={{ marginLeft: 10 }}>Velocidad del tag: </label><Select defaultValue="100" style={{ width: 150, marginLeft: 10, marginTop: -5 }} onChange={val => onChangeSpeed(val)}>
                <Option value="200">Despacio</Option>
                <Option value="100">Normal</Option>
                <Option value="50">Rápido</Option>
              </Select>
            </Col>
            {/* Route buttons */}
            <Col xl={4} md={2} sm={24}></Col>
            <Col xl={16} md={20} sm={24} style={{ marginTop: 40, marginBottom: 10, justifyContent: "center", textAlign: "center" }}>
              <Button type="primary" id="btnSaveRoute" style={{ marginLeft: 0 }}
                onClick={() => {
                  //guardar ruta
                  let data = JSON.parse(saveableCanvas.getSaveData());
                  let coordenadas = [];
                  let tag = tagForRoute;
                  let name = tagRouteName;
                  let plus = tagSpeed;
                  // let myDate = new Date(Date.now());
                  // let date = myDate.getFullYear() + '-' +('0' + (myDate.getMonth()+1)).slice(-2)+ '-' +  ('0' + myDate.getDate()).slice(-2) + ' '+myDate.getHours()+ ':'+('0' + (myDate.getMinutes())).slice(-2)+ ':'+myDate.getSeconds()+ '.'+myDate.getMilliseconds()+ " +00:00";
                  getMeta(
                    process.env.REACT_APP_API + "image/" + svgImg,
                    function (width, height) {
                      //console.log("width: "+svgWidth+", height: "+svgHeight);
                      let xSize = parseFloat(svgWidth) * 100;
                      let ySize = parseFloat(svgHeight) * 100;

                      if (data && data.lines[0]) {
                        for (let i = 0; i < data.lines[0].points.length; i++) {
                          // console.log("x: "+parseInt(data.lines[0].points[i].x) * parseInt(svgWidth)/stageWidth+", y: "+parseInt(data.lines[0].points[i].y) * parseInt(svgHeight)/stageHeight);
                          let myDate = new Date(Date.now() + (i * plus));
                          let date = myDate.getFullYear() + '-' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' + ('0' + myDate.getDate()).slice(-2) + ' ' + (myDate.getHours() - 1) + ':' + ('0' + (myDate.getMinutes())).slice(-2) + ':' + myDate.getSeconds() + '.' + myDate.getMilliseconds() + " +00:00";
                          coordenadas.push({
                            id_tag_fk: parseInt(tag),
                            x: parseFloat(data.lines[0].points[i].x) * parseFloat(svgWidth) / stageWidth,
                            y: svgHeight - parseFloat(data.lines[0].points[i].y) * parseFloat(svgHeight) / stageHeight,
                            z: 0,
                            hpl: 0,
                            vpl: 0,
                            tag_name: name,
                            msg_type: 1,
                            datetime: date,
                          });

                        }
                        //createPos
                        //generar ruta en BD
                        //Crear stage
                        axios.post(process.env.REACT_APP_API + "tagpos", { message: coordenadas })
                          .then(response => openNotificationWithIcon('success', 'Ruta guardada con éxito.'))
                          .catch((message) => openNotificationWithIcon('error', 'La ruta no ha sido guardada.', 'Comprueba si has dibujado la ruta o si no has seleccionado el tag.'))
                      } else {
                        openNotificationWithIcon('error', 'La ruta no ha sido guardada.', 'Comprueba si has dibujado la ruta o si no has seleccionado el tag.');
                      }


                    }
                  )

                }} ><SaveOutlined />Guardar Ruta</Button>
              <Button type="primary" id="btnBackRoute" style={{ marginLeft: 5 }} onClick={() => { this.saveableCanvas.undo(); }}><RollbackOutlined />Deshacer</Button>
              <Button type="primary" id="btnDeleteRoute" style={{ marginLeft: 5 }} onClick={() => { this.saveableCanvas.eraseAll(); }}><DeleteOutlined />Eliminar Ruta</Button>
            </Col>
            <Col xl={4} md={2} sm={24}></Col>
          </Row>
          {/* ROW trazar area restricción */}
          <Row style={{ marginTop: 20, justifyContent: "center", display: map_option == "create_area" ? "flex" : "none", textAlign: "center" }}>
            <div>
              {/* <label>Trazar area para los tags:</label>
            <Select
                //mode="multiple"
                id="selectTagRoute"
                showSearch
                optionFilterProp="children"
                placeholder="Tags"
                //className={"full-width"}
                onChange={val => this.onChangeTagRoute(val)}
                value={tagForRoute || null}
                //filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{marginLeft:10, minWidth:50}}
              >
                {tags
                  ? tags.map((item, i) => (
                      <Select.Option key={item.id_tag} value={item.id_tag}>
                        {item.name}
                      </Select.Option>
                    ))
                  : null}
            </Select> */}
              <Button type="primary" style={{ display: "block", marginTop: 10 }} onClick={() => addArea(numAreas)}>Agregar nueva area de restricción</Button>
            </div>
          </Row>
          {/* Row download CSV */}
          <Row>
            <Col xl={4} md={2} sm={24}></Col>
            <Col xl={16} md={20} sm={24} style={{ justifyContent: "center", textAlign: "center", display: "flex", marginTop: 10 }}>
              <CSVLink
                data={csvData ? csvData : []}
                headers={headersCSV}
                filename={"Datos_tags.csv"}
                separator={";"}
                target="_blank"
                style={{ textDecoration: 'none', outline: 'none', height: '5vh' }}
              >
                <Button id="btnDwnload" size="small" style={{ marginRight: 10, marginTop: 10 }}  ><DownloadOutlined /> Descargar CSV</Button>
              </CSVLink>
              <Button style={{ marginTop: 10 }} size="small" onClick={() => importData()}><DownloadOutlined /> Importar CSV</Button>
              <input type="file" accept=".csv" id="btnImport" name="btnImport" style={{ marginTop: 10, visibility: "hidden", position: "absolute" }}
                onChange={e => handleChangeFile(e.target.files[0])} />
            </Col>
            <Col xl={4} md={2} sm={24}></Col>
          </Row>
          {/* Row Content */}
          <Row style={{ marginTop: 20 }} >
            <Col xl={4} md={2} sm={24}></Col>
            <Col xl={16} md={20} sm={24} style={{ border: "solid lightgray 1px", borderRadius: "5px", padding: 20, boxShadow: "0 8px 8px -2px lightgray", marginBottom: 50, height: "700px", overflowX: "scroll", overflowY: "scroll" }}>
              {map_option == "create_area" ?

                <div id="divAreasRes" style={{
                  objectFit: "cover",
                  WebkitBackgroundSize: "cover",
                  transform: `scale(${zoomLevel})`,
                  marginTop: "20px",
                  backgroundImage: "url('" + process.env.REACT_APP_API + "image/" + svgImg + "')",
                  minHeight: stageHeight ? stageHeight : svgHeight,
                  maxHeight: stageHeight ? stageHeight : svgHeight,
                  maxWidth: stageWidth ? stageWidth : svgWidth,
                  minWidth: stageWidth ? stageWidth : svgWidth,
                  transformOrigin: "top left",
                  transition: "transform 0.25s",
                }}
                  onWheel={handleZoom}>
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0,
                    transform: `translate(-${zoomLevel * 100 - 100}%, -${zoomLevel * 100 - 100}%)`
                  }}>
                    {areas}
                    {newAreas}
                  </div>
                </div>
                :
                <div style={{ height: "100%", minHeight: "500px", justifyContent: "center", textAlign: "center", display: "flex"/*backgroundColor:"#ccc"*/ }}>
                  {map_option == "heatmap" ? (
                    <Heatmap stage={stageSelected} heatmap={heatmap} />
                  ) : map_option == "pos_for_time" ? (
                    <>
                      <SvgPosition
                        stage={stageSelected}
                        tags={svgData}
                        areas={areasSelected}

                        img={svgImg}
                        width={svgWidth}
                        height={svgHeight}
                        tag_size={tagSize}
                        realTime={false}
                        alarms={tableAlarms}
                      />
                    </>
                  ) : (
                    // <SvgIndex stage={stageSelected} data={svgData} />
                    <CanvasDraw
                      ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                      brushColor={"#e65e28"}
                      brushRadius={brushSize}
                      imgSrc={svgImg ? process.env.REACT_APP_API + "image/" + svgImg : ""}
                      canvasWidth={stageWidth && stageWidth > 0 ? stageWidth : svgWidth}
                      canvasHeight={stageHeight && stageHeight > 0 ? stageHeight : svgHeight}

                    // style={{
                    //   boxShadow:
                    //     "0 13px 27px -5px rgba(50, 50, 93, 0.25),    0 8px 16px -8px rgba(0, 0, 0, 0.3)"
                    // }}
                    />
                  )
                  }

                </div>
              }
            </Col>
            <Col xl={4} md={2} sm={24}></Col>
          </Row>

          {/* Row Table Analysis */}
          <Row style={{ marginTop: 20, marginBottom: 20, display: map_option == "create_route" || map_option == "create_area" ? "none" : "flex" }} >
            <Col xl={4} md={2} sm={24}></Col>
            <Col xl={16} md={20} sm={24} style={{ marginTop: 0 }}>
              {/* <Card title="INFORMACIÓN EXTRA" style={{boxShadow:"0 8px 8px -2px lightgray", padding:30}}> */}
              {/* Row Info Boxes */}
              {/* <Row style={{ marginTop:30, justifyContent:"center", display:"none", textAlign:"center"}}>
                    <Col xl={16} md={12} sm={24}>
                      <Row>
                      <Col span={6}>
                          <Box title="Nº Paradas" value='-' unit="" />
                        </Col>
                        <Col span={6}>
                          <Box title="Nº Alertas" value='-' unit=""/>
                        </Col>
                        <Col span={6}>
                          <Box title="Distancia total" value={distance_global} unit="m" type="label" />
                        </Col>
                        <Col span={6}>
                          <Box
                            title="Tiempo"
                            value={[time_move_global, time_stop_global]}
                            //unit="m"
                            type="donut"
                            total={time_global}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row> */}
              {/* Row  Table Analysis*/}
              <Row style={{ marginTop: 0, marginBottom: 50, justifyContent: "center", textAlign: "center" }}>
                <Col xl={24} md={24} sm={24} style={{ boxShadow: "0 8px 8px -2px lightgray" }}>
                  <TablaAnalisys data={tableData} columsExtra={columsExtra} />
                </Col>
              </Row>
              {/* Row Line chart */}
              <Row>
                <Col xl={24} md={24} sm={24} style={{ position: "absolute", visibility: "hidden" }}>
                  <LineChart style={{ position: "absolute", visibility: "hidden" }} data={lineChartData} layout={{
                    hovermode: 'x unified', colorway: colors, showlegend: false, width: 10, height: 10,
                    shapes: [{
                      type: 'line',
                      xref: 'x',
                      yref: 'paper',
                      x0: actualChartDate,
                      y0: 0,
                      x1: actualChartDate,
                      y1: 1,
                      line: {
                        width: 3,
                        dash: 'dot'
                      }
                    }]

                  }}
                    onChange={onChangeHoverChart.bind(this)}
                  />
                </Col>
              </Row>
            </Col>
            <Col xl={2} md={2} sm={24}></Col>
          </Row>



          {/* CARD INFORMATION */}
          {/* <Row style={{marginTop:40}}>
            <Col xl={4} md={2} sm={24}></Col>
            <Col xl={16} md={20} sm={24} > */}
          {/* <Card title="INFORMACIÓN EXTRA" style={{boxShadow:"0 8px 8px -2px lightgray", padding:30}}> */}
          {/* Row Info Boxes */}
          {/* <Row style={{ marginTop:20, justifyContent:"center", display:"none", textAlign:"center"}}>
                  <Col xl={16} md={12} sm={24}>
                    <Row>
                    <Col span={6}>
                        <Box title="Nº Paradas" value='-' unit="" />
                      </Col>
                      <Col span={6}>
                        <Box title="Nº Alertas" value='-' unit=""/>
                      </Col>
                      <Col span={6}>
                        <Box title="Distancia total" value={distance_global} unit="m" type="label" />
                      </Col>
                      <Col span={6}>
                        <Box
                          title="Tiempo"
                          value={[time_move_global, time_stop_global]}
                          //unit="m"
                          type="donut"
                          total={time_global}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Divider></Divider> */}
          {/* Row line Chart */}
          {/* <Row style={{justifyContent:"center", textAlign:"center", display:"none"}}>
                  <Col xl={24} md={24} sm={24}>
                    {lineChartData ? (
                          <div>
                          <LineChart data={lineChartData} style={{zIndex:-1, marginTop:-60}} layout={{hovermode:'x unified',title: 'Posicion de los tags a lo largo del tiempo', colorway:colors, showlegend:false, width:600, height:400,
                            shapes: [{
                              type: 'line',
                              xref: 'x',
                              yref: 'paper',
                              x0: actualChartDate,
                              y0: 0,
                              x1: actualChartDate,
                              y1: 1,
                              line: {
                                width: 3,
                                dash: 'dot'
                              }
                            }]

                            }} onChange={this.onChangeHoverChart.bind(this)} />
                            </div>
                        ) : (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No hay datos"} />
                        )}
                  </Col>
                </Row> */}
          {/* <Divider></Divider> */}
          {/* Row  Table Analysis*/}
          {/* <Row style={{ marginBottom:50, justifyContent:"center", textAlign:"center"}}>
                  <Col xl={24} md={24} sm={24} style={{boxShadow:"0 8px 8px -2px lightgray"}}>
                    <TablaAnalisys data={tableData} columsExtra={columsExtra} />
                  </Col>
                </Row> */}
          {/* </Card> */}
          {/* </Col>
            <Col xl={4} md={2} sm={24}></Col>
          </Row> */}

          {/* <Row type="flex" justify="space-between" gutter={16} >
            <Col xl={24} md={24} sm={24}>
              <div style={{ height: "calc(17% - 9px)" , marginTop: "12px",marginBottom: "12px"}}>
                <Row style={{ height: "100%" }}>
                  <Col xl={6} md={12} sm={24}> */}
          {/* <Radio.Group onChange={this.onChangeRadio} name="map_option" value={map_option} size="large">
                      {tagsSelected && tagsSelected.length > 1
                        ? map_options.map((item, i) => (
                            <Radio disabled={!item.multiple ? true : false} style={radioStyle} key={item.value} value={item.value}>
                              {item.name}
                            </Radio>
                          ))
                        : map_options.map((item, i) => (
                            <Radio style={radioStyle} key={item.value} value={item.value}>
                              {item.name}
                            </Radio>
                          ))}
                    </Radio.Group> */}
          {/* </Col>
                </Row> */}
          {/* <Row style={{ marginTop:30, justifyContent:"center", display:"flex", textAlign:"center" }}>
                  <Col xl={16} md={12} sm={24}>
                    <Row type="flex" justify="end" gutter={16}>
                    <Col span={6}>
                        <Box title="Nº Paradas" value='-' unit="" />
                      </Col>
                      <Col span={6}>
                        <Box title="Nº Alertas" value='-' unit=""/>
                      </Col>
                      <Col span={6}>
                        <Box title="Distancia total" value={distance_global} unit="m" type="label" />
                      </Col>
                      <Col span={6}>
                        <Box
                          title="Tiempo"
                          value={[time_move_global, time_stop_global]}
                          unit="m"
                          type="donut"
                          total={time_global}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row> */}
          {/* </div> */}

          {/* <div >
                {map_option == "pos_for_time" ? <>
                  <Col xl={24} md={24} sm={24}>
                    <Tooltip title="-30min">
                      <Button type="default" shape="circle" icon={<FastBackwardOutlined />} onClick={() => this.minus30min() }/>
                    </Tooltip>
                    <Tooltip title="Slower">
                      <Button type="default" shape="circle" icon={<BackwardOutlined />} onClick={() => this.slowerChart() }/>
                    </Tooltip>
                    <Tooltip title= {play == true ? "Play" : "Pause"}>
                      <Button type="default" shape="circle" icon={play == true ? <CaretRightOutlined /> : <PauseOutlined />} onClick={() => this.playChart()}/>
                    </Tooltip>
                    <Tooltip title="Stop">
                      <Button type="default" shape="circle" icon={<BorderOutlined />} onClick={() => this.resetInterval()}/>
                    </Tooltip>
                    <Tooltip title="Faster">
                      <Button type="default" shape="circle" icon={<ForwardOutlined />} onClick={() => this.fasterChart()}/>
                    </Tooltip>
                    <Tooltip title="+30min">
                      <Button type="default" style={{ marginRight: "10px"  }} shape="circle" icon={<FastForwardOutlined />} onClick={() => this.plus30min()}/>
                    </Tooltip>
                    Distancia entre datos:
                    <Select
                        optionFilterProp="children"
                        placeholder="Intervalo tiempo"
                        style={{ width: 150, marginLeft: "10px"  }}
                        className={"full-width"}
                        onChange={val => this.onChange(val, "intervalTime")}
                        value={intervalTime}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      >
                        {intervalTimers ? intervalTimers.map((item, i) => (
                              <Select.Option key={item.name} value={item.value}>
                                {item.name}
                              </Select.Option>
                            ))
                          : null}
                      </Select>
                    </Col>
                    <h4 style={{marginTop: "10px" }}> Fecha a recorrer  : {[playChartDate.format('YYYY-MM-DDTHH:mm:ss').replace('T',' ').toString()]}</h4>

                </>
                : (
                  <Space></Space>
                )}
                {lineChartData ? (
                  <LineChart data={lineChartData} layout={{hovermode:'x unified', colorway:colors, showlegend:false, width:600, height:400,
                    shapes: [{
                      type: 'line',
                      xref: 'x',
                      yref: 'paper',
                      x0: actualChartDate,
                      y0: 0,
                      x1: actualChartDate,
                      y1: 1,
                      line: {
                        width: 3,
                        dash: 'dot'
                      }
                    }]

                    }} onChange={this.onChangeHoverChart.bind(this)} />
                    
                ) : (
                  // <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No hay datos"} />
                  <></>
                )}

              </div> */}

          {/* <div style={{ height: "calc(13% - 19px)", marginTop: "1px" }}>
                <TablaAnalisys data={tableData} columsExtra={columsExtra} />
              </div> */}
          {/* </Col>
          </Row> */}
        </Spin>
      </div>
    );
  }
}