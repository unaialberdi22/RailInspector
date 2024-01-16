import React, { useContext, useEffect, useState, useLayoutEffect, useRef, prevState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import '../node_modules/leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import {Icon} from 'leaflet';
import './selector.css';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';
// import Graph from "./Graph";
import AppContext from "./context/AppContext";

// Sistema totalmente dinamico, da igual las coordenadas que le insertes, 
// mientras los insertes en grupos, el programa se ocupara de adaptarse a la cantidad de grupos
export default function Leaflet() {
  //Variables 
    const [initPositions, setInitPositions] = useState([])
    const [newPositions, setNewPositions] = useState([])
    const [checkboxes, setCheckboxes] = useState([])
    const [linePositions, setLinePositions] = useState([])
    const [lineNames, setLineNames] = useState([])
    const [loading, setLoading] = useState(false)
    const [KMArray, setKMArray] = useState([])
    const [kilometers, setKilometers] = useState([])
    const [fechas, setFechas] = useState(new Date().toJSON().slice(0, 10))

  // Llamada a variables de estado y setters globales
    const {setLine, setType, setData, setFechaData, setDisplay}= useContext(AppContext)

  //Fetches
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    // guarda posiciones y nombres de lineas
    async function fetchInitPositions() {
      try {
        const response = await fetch("http://10.63.140.63:3010/Coordenadas", requestOptions);
        const result = await response.json();
        const APIPositions = result.map(obj => obj.latlon);
        const newInitPositions = []
        APIPositions.map((coordenadas) => {
          newInitPositions.push(coordenadas)
        })
        setInitPositions(newInitPositions);

        const APILineas = result.map(obj => obj.line);
        const APIVias = result.map(obj => obj.track);
        const newLineNames = APILineas.map((element1, index) => [element1, APIVias[index]]);
        setLineNames(newLineNames)
        console.log(newLineNames)
       
      } catch (error) {
        console.log('error', error);
      }
    }
    // guarda los kilometros de la fecha que esta en la variable fecha
    async function fetchKilometer(fecha) {
      console.log("dentro de fetch con la fecha: " + fecha)
      try {
        const response = await fetch(`http://10.63.140.63:3010/Kilometro/${fecha}`, requestOptions);
        const result = await response.json();
        const APIKilometers = result.map(obj => obj.kilometros);
        const initKilometers = []
        APIKilometers.map((km) => {
          initKilometers.push(km)
        })
        setKilometers(initKilometers)
      } catch (error) {
        console.log('error', error);
      }
    }
    // Usando la variable de estado de KMArray y las variables de tipo de dato, nombre de la linea seleccionada,
    // el index de la linea seleccionada y la fecha que le llegan, saca todos los datos de los sensores.
    async function fetchGraphData(type, line, indexKM, fecha) {
      try {
        const response = await fetch(`http://10.63.140.63:3010/Datos/${type}/${line.split(",")[0]}/${KMArray[indexKM][0]}/${KMArray[indexKM][1]}/${fecha}/${line.split(",")[1]}`, requestOptions);
        const result = await response.json();
        const sensordata = result.map(obj => obj.data);
        const dataArray = [];
        sensordata.map((dataline) => {
          dataArray.push(dataline)
        })
        const processedData = [];
        dataArray[0].map((data, index) => {
          processedData[`${index}`] = {pk:`${data[0]}`, left:`${data[1]}`, right:`${data[2]}`};
        })
        setData(processedData);
        console.log(processedData);
        setDisplay(true);
      } catch (error) {
        setDisplay(false);
        alert("No hay datos en la fecha seleccionada");
        console.log('error', error);
      }
    }

  //use effects

    useEffect(() => {
      fetchInitPositions()
      fetchKilometer(fechas)
    }, []);

    useEffect(() => {
      setKM()
    }, [kilometers]);
      
    useEffect(()=>{
      setLoading(true);
      fetchKilometer(fechas)
      //para los checkboxes
      const newCheckboxes = [];
      initPositions.map((linea, lineaIndex) => {
        newCheckboxes[`${lineaIndex}`] = {name: `${lineNames[lineaIndex]}`,value :true};
      })

      //para el array con los IDs, coordenadas ordenadas y nombres
      const newPositions = initPositions.map((grupoCordenadas, grupoIndex) => {
        const positions = grupoCordenadas.map((pos, index) => {
          const id = index + 1;
          const position = [pos[1], pos[0]];
          const name = "grupo " + (grupoIndex + 1);
          return {id, position: position, name};
        });
        return positions;
      });
      

      const newLinePositions = newPositions.map((marker) => marker.map((line) => line.position)); 
      setCheckboxes(newCheckboxes)
      setNewPositions(newPositions);
      setLinePositions(newLinePositions)
      setLoading(false);
    },[initPositions]) 
  // Otras funciones
    // Controla los checks del selector de lineas, que muestra y esconde las lineas acorde a lo que este activado
    const handleCheckboxChange = (event) => {
      const index = parseInt(event.target.id);
      const newCheckBoxValue = [...checkboxes];
      const newValue = {...newCheckBoxValue[index],value: !newCheckBoxValue[index].value,};
      newCheckBoxValue.splice(index, 1, newValue);
      setCheckboxes(newCheckBoxValue);
    };

    console.log(checkboxes)
    // Al pulsar el boton de filtrar del popup, se activa
    const handleClick = async (type, line, index, fecha) => {
      setType(type);
      setLine(line);
      setFechaData(fecha);
      const indexKM = index;
      await fetchGraphData(type, line, indexKM, fecha);
    }

    // cada vez que la variable de estado de kilometro cambia (suele ocurrir cuando cambiamos de linea y fecha), se activa y
      const setKM = () => {
        const KMList = []
        kilometers.map((k, index = 0) =>{
        const KMValue = [kilometers[index][0],kilometers[index][kilometers[index].length - 1]]
        console.log("mostrando los dos extremos de los kilometros: " + KMValue)
        KMList.push(KMValue)
        setKMArray(KMList)
      });
      console.log(KMList)
      console.log(KMArray)
      }

      const handleChange = (event, newValue, index) => {
        const newKM = [...KMArray];
        newKM[index] = [newValue[0], newValue[1]];
        setKMArray(newKM)
      };

      const changeDate = (fecha) => {
        setFechas(fecha);
        fetchKilometer(fecha);
      }

      // const updateKM = (index) => {
      //   const newKM = [...KMArray];
      //   newKM[index] = [kilometers[index][0], kilometers[index][kilometers[index].length - 1]];
      //   setKMArray(newKM)
      // }
      
   return KMArray.length>0 && !loading ? (
    <div id="maps">
      <div id="selector">
        <h1>Selector de lineas</h1>
        <form>
          {checkboxes.map((item, index) => {
            return (
              <div key={item.name}>
                <input
                  type="checkbox"
                  id={index}
                  name={item.name}
                  value={item.value}
                  checked={item.value}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={item.name}>{item.name}</label>
                <br />
              </div>
            );
          })}
        </form>
      </div>
      <MapContainer center={[43.29473618607522, -2.355245889465669]} zoom={11}>
        <TileLayer url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png" />
  
        {newPositions.map((marker, index) =>
          checkboxes[index]?.value && marker.map((data) => (
            <Marker key={data.id} position={data.position} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12.5, 41] })} />
          ))
        )}
        {console.log(checkboxes)}
        {linePositions.map((lines, index) => (
          checkboxes[index]?.value ? (
            <Polyline key={index} positions={lines} title="" color={"#" + Math.floor(Math.random() * 16777215).toString(16)} weight={7}>
              <Popup>
                {console.log(checkboxes[index].name + ": " + KMArray[index][0] + " " + KMArray[index][1])}
                <h1>{checkboxes[index].name}</h1>
                <div>
                  <form>
                    <div>
                      <label htmlFor="fecha">Selecciona fecha:</label>
                      <input type="date" id="fecha" name="fecha" value={fechas} min="2019-09-20" max={new Date().toJSON().slice(0, 10)} onChange={() => {
                         changeDate(document.getElementById("fecha").value)
                      }}></input>
                    </div>
                    <div>
                      <label htmlFor="dataType">Selecciona tipo de dato:</label>
                      <select name="dataType" id="dataType">
                        <option value="align">Alineacion</option>
                        <option value="level">Niveles</option>
                      </select>
                    </div>
                  </form>
                </div>
                {
  (!isNaN(parseFloat(kilometers[index][0])) && !isNaN(parseFloat(kilometers[index][parseFloat(kilometers[index].length - 1)]))) ? (
    <div>
     
      {console.log(KMArray[index])}
      <p>{parseFloat(KMArray[index][0]) + " -- " + parseFloat(KMArray[index][1])}</p>
        <Slider
          min={parseFloat(kilometers[index][0])}
          max={parseFloat(kilometers[index][kilometers[index].length - 1])}
          value={KMArray[index]}
          step={0.00025}
          getAriaLabel={() => "Kilometer range"} 
          valueLabelDisplay="auto"
          onChange={(event, newValue) => {
            handleChange(event, newValue, index);
          }}
        />
      <div>
        <button type='button' onClick={() => handleClick(document.getElementById("dataType").value, checkboxes[index].name, index, document.getElementById("fecha").value)}>Filtrar</button>
      </div>
    </div>
  ) : (
    <p><strong>No hay datos en esta fecha. <br></br>Cambie de fecha.</strong></p>
  )
}
              </Popup>
            </Polyline>
          ) : null
        ))}
      </MapContainer>
    </div>
  ):<CircularProgress />
  }