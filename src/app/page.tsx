"use client";
import "./globals.css";
import * as d3 from "d3";
import * as topojson from "topojson";
import { useEffect, useState } from "react";
import { br } from "./br-data";
import { mdiFileChart, mdiArrowLeft } from '@mdi/js';
import { Card, Typography, CardContent, CardActions, Container, Button, Divider  } from '@mui/material';
import Icon from '@mdi/react';
import { cities } from "./cities";
import { county } from "./county";
import RemoveRedEyeSharpIcon from '@mui/icons-material/RemoveRedEyeSharp';
import SpaSharpIcon from '@mui/icons-material/SpaSharp';
import { amzPA } from "./amz";
import { loggingPA } from "./desmataPA";

export default function Home() {
  const [nameButton, setNameButton] = useState("");
  const [clickBack, setClickBack] = useState(false);
  const [index, setIndex] = useState(0);
  const mapLoggingPa = new Map(loggingPA.map((b: { id: number, area_total: number }) => [b.id, b.area_total]));
  const mapCertificationsCurrent = new Map(amzPA.map((b: { id: number, qtd_vigente: number }) => [b.id, b.qtd_vigente]));
  const mapCertificationsProgress = new Map(amzPA.map((b: { id: number, qtd_andamento: number }) => [b.id, b.qtd_andamento]));
  const [travelPath, setTravelPath] = useState([
    {
      name: "", 
      func: null, 
      event: null, 
      d: null
    },
    {
      name: "", 
      func: null, 
      event: null, 
      d: null
    },
    {
      name: "", 
      func: null, 
      event: null, 
      d: null
    }
  ]);
  const [selected, setSelected] = useState(false);
  const [dataScore, setDataScore] = useState(
    {
      name: "Pará", 
      certificates_current: "3",
      certificates_progress: "1",
      logging: "8.8 milhões",
      infoText: "Empresa(s)",
    }
  );

  const exec = () => {
    setClickBack(true);
    const func: any = travelPath[index]["func"];

    func(travelPath[index]["event"], travelPath[index]["d"]);
  }

  useEffect(() => {
    let namemapState: any;
    const width: any = 863;
    const height: any = 647;
    const colorsCustom = ["red", "yellow", "green"];
    const color: any = d3.scaleSequential().domain([0, 3])
      .interpolator(d3.interpolateRgbBasis(colorsCustom));

    const svg: any = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; background: #CBCBCB");

    function travel(index: number, name: string, func: any, event: any, d: any) {
      travelPath[index]["name"] = name;
      travelPath[index]["func"] = func;
      travelPath[index]["event"] = event;
      travelPath[index]["d"] = d;
    }

    const g: any = svg.append("g");

    var projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width, height], topojson.feature(br, br.objects.uf));
    
    const path: any = d3.geoPath().projection(projection);
    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

    function configMap(data: any, dataColors:any, localData:any, dataBorder: any, localMap: any) {
      g.append("g")
        .attr("fill", "#BEC0CC")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", dataColors)
          .on("click", localMap)
          .attr("d", path)
        .append("title").text(localData);
    
      g.append("path")
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("d", path(dataBorder));

    }

    function zoomIn() {
      cardZoom("black");
      svg.transition()
        .duration(750)
        .call(
          zoom.scaleBy, 1.4
        ); 
    }

    function zoomOut() {
      if (d3.zoomTransform(svg.node()).k === 1) {
        cardZoom("#BEC0CC");
      }
      svg.transition()
        .duration(750)
        .call(
          zoom.scaleBy, 1 / 1.4
        ); 
    }

    function cardZoom(color: any) {
      svg.append("rect")
        .attr("x", 535)
        .attr("y", 588)
        .attr("width", 315)
        .attr("height", 48)
        .attr("padding", 4)
        .attr("rx", 4) 
        .attr("ry", 4)
        .attr("fill", "#FFFFFF")
        .attr("cursor", "pointer");

      svg.append("image")
        .attr("x", 550)  
        .attr("y", 599) 
        .attr("height", 28)
        .attr("cursor", "pointer")
        .on("click", zoomIn)
        .attr("xlink:href", "map/magnify-plus.svg"); 

      svg.append("image")
        .attr("x", 605)  
        .attr("y", 599) 
        .attr("height", 28)
        .attr("padding", 28)
        .attr("cursor", "pointer")
        .on("click", zoomOut)
        .attr("xlink:href", "map/magnify-minus.svg")

      svg.append("line")
        .attr("x1", 650)  
        .attr("y1", 604)  
        .attr("x2", 650) 
        .attr("y2", 621) 
        .attr("stroke", "#BEC0CC") 
        .attr("stroke-width", 1);
      
      svg.append("text")
        .attr("x", 675)  
        .attr("y", 618) 
        .attr("font-weight", "700")
        .attr("fill", color) 
        .attr("cursor", "pointer")
        .on("click", para)
        .text("Redefinir Visualização");
    }

    function para() {
      const valuemap = new Map(county.map((b: { cod: number, valor: number }) => [b.cod, b.valor]));
      const data: any = topojson.feature(cities["data"], cities["data"].objects[cities.id])
      namemapState = new Map(county.map((b: { cod: number, nome: string }) => [b.cod, b.nome]));
      configMap(data, (a: any) => color(valuemap.get(a.properties.cod)), (a: any) => `${namemapState.get(a.properties.cod)}\n${valuemap.get(a.properties.cod)}`, topojson.mesh(cities["data"], cities["data"].objects[cities.id], (a, b) => a !== b), city)
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(-800, -120)
            .scale(
              3
            )
        );

      cardZoom("#BEC0CC");
      if (clickBack === false) {
        travel(0, "Brasil", para, null, null);
      }

      setNameButton("");
      setIndex(0);
    }

    function city(event: any, d: any) {
      const [[x0, y0], [x1, y1]] = path.bounds(d);
      const dataFeatureCity: any = topojson.feature(cities["data"], cities["data"].objects[cities.id])
      const countyFiltred = county.filter((a: any) => a.cod === d.properties.cod)
      const valuemapCity = new Map(countyFiltred.map((b: { cod: number, valor: number }) => [b.cod, b.valor]));
      const namemapCity = new Map(countyFiltred.map((b: { cod: number, nome: string }) => [b.cod, b.nome]));
      event.stopPropagation();
      
      configMap(dataFeatureCity, (d: any) => color(valuemapCity.get(d.properties.cod)), (d: any) => `${namemapCity.get(d.properties.cod)}\n${valuemapCity.get(d.properties.cod)}`, topojson.mesh(cities["data"], cities["data"].objects[cities.id], (a, b) => a !== b), para);
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
              Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        );

      cardZoom("black");

      setIndex(2);
      setNameButton(travelPath[2]["name"]);
      setDataScore(
        {
          name: String(namemapCity.get(d.properties.cod)), 
          certificates_current: mapCertificationsCurrent.get(d.properties.cod) !== undefined ? String(mapCertificationsCurrent.get(d.properties.cod)) : "0", 
          certificates_progress: mapCertificationsProgress.get(d.properties.cod) !== undefined ? String(mapCertificationsProgress.get(d.properties.cod)) : "0", 
          logging: String(mapLoggingPa.get(d.properties.cod)),
          infoText: "Empresa(s)",
        }
      );
      console.log(mapCertificationsCurrent.get(d.properties.cod))
    }

    function zoomed(event: any) {
      const { transform } = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
    }

    para();

    svg.call(zoom);

    const mapa: any = document.getElementById("map");
    mapa.append(svg.node());
    
  }, []);

  const handleClickScore = () => {
    setSelected(!selected);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 0
        }}
      >
        <Container sx={{ display: "flex", width: "100% !important", height: "120px", bgcolor: "#229954", m: "0 !important", minWidth: "100%", justifyContent: "center", alignItems: "center" }}>
          <SpaSharpIcon sx={{ fontSize: "60px", color: "#FFF", mr: "15px" }} />
          <Typography sx={{ fontSize: "50px", color: "#FFF" }} >
            Análise Geográfica
          </Typography>
        </Container>  
        <Card sx={{ width: 690, height: "auto", marginTop: "40px", boxShadow: "0px 0px 6px #CCC" }}>
          <Container sx={{  display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 15px 0 15px !important" }}>
            <Typography variant="h3" sx={{ fontSize: "16px", fontWeight: 600, color: "#252833", display: "flex", justifyContent: "start", alignItems: "center" }} >
              Empresas Certificadas
            </Typography>
            <CardActions>
              <Button variant="contained" sx={{ fontSize: "14px", fontWeight: 500, color: "#FFF", bgcolor: '#229954 !important', textTransform: "none", letterSpacing: "none", padding: '2px 7px' }} onClick={handleClickScore} >
                <RemoveRedEyeSharpIcon sx={{ fontSize: "18px", color: "#FFF", marginRight: "5px" }} />
                Dados
              </Button>
            </CardActions>
          </Container>
          <CardContent sx={{ padding: "0 15px" }}>
            <div id="map" className="map">
              <CardActions sx={{ position: "fixed", margin: "5px" }}>
                {nameButton !== "" && (
                  <Button onClick={exec} sx={{ display: "flex", alignItems: "center", width: "auto", height: "14px", padding: "20px", background: "#FFFFFF", borderRadius: "4px", fontWeight: 700, fontSize: "14px", color: "#404554", textTransform: "none", letterSpacing: "none" }}>
                    <Icon path={mdiArrowLeft} size={0.9} style={{ marginRight: "8px" }} />
                    { nameButton }
                  </Button>
                )}
              </CardActions>
              <div style={selected ? {display: 'flex', position: 'absolute', width: '660px', transition: "all 300ms ease-in-out" } : { transform: "translateX(-500px)", width: "0", height: "0", transition: "all 300ms ease-in-out", position: 'absolute', opacity: 0 }}>
                <Card sx={{ width: '200px', height: "auto", padding: '16px', gap: '16px', margin: '13px', boxShadow: '0px 4px 6px -1px #0000001A' }}>
                  <Typography sx={{ fontSize: "18px", fontWeight: "600" }}>{dataScore.name}</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: "500", padding: "10px 0 10px 0", textAlign: "justify" }}>Há <b>{dataScore.certificates_current}</b> {dataScore.infoText} com selo AMZ vigentes.</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: "500", padding: "10px 0 10px 0", textAlign: "justify" }}>Há <b>{dataScore.certificates_progress}</b> {dataScore.infoText} com selo AMZ em andamento.</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: "500", padding: "10px 0 10px 0", textAlign: "justify" }}>Esta área corresponde a <b>{dataScore.logging} Km²</b> da Amazônia Legal.</Typography>
                </Card>
              </div>
            </div>
          </CardContent>
          <div className="legend">
            <div className="legend-map">
              <div className="col-legend">
                <div className="block1"></div>
                <p className="p-legend">Positivo</p>
              </div>
              <div className="col-legend">
                <div className="block2"></div>
                <p className="p-legend">Mediano</p>
              </div>
              <div className="col-legend">
                <div className="block3"></div>
                <p className="p-legend">Negativo</p>
              </div>
            </div>
          </div>
        </Card>
        <Container sx={{ display: "flex", width: "100% !important", height: "40px", m: "0 !important", minWidth: "100%", justifyContent: "center", alignItems: "center", mt: "40px !important" }}>
          <Typography sx={{ fontSize: "12px" }} >
            © SIG
          </Typography>
        </Container>  
      </div>
    </>
  );
}
