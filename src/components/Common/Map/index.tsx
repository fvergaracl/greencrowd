import { useRouter } from "next/router"
import React, { useEffect, useMemo, useState, useRef } from "react"
import ReactDOMServer from "react-dom/server"
import {
  MapContainer as LeafletMapContainer,
  Circle,
  Tooltip,
  TileLayer,
  Marker,
  Polygon,
  Popup,
  useMap
} from "react-leaflet"
import L, { DivIcon } from "leaflet"
import "leaflet-routing-machine"
import LeafletRoutingMachine from "leaflet-routing-machine"
import CustomMarker from "../Mapmarker"
import "leaflet/dist/leaflet.css"
import { useDashboard, DashboardContextType } from "@/context/DashboardContext"
import { useAdmin, AdminContextType } from "@/context/AdminContext"
import MapControls from "./MapControls"
import { useTranslation } from "@/hooks/useTranslation"
import FitBounds from "./FitBounds"
import "../styles.css"
import {
  Point,
  Task,
  PolygonData,
  CampaignData,
  PointOfInterest
} from "./types"

interface MapProps {
  showMyLocation?: boolean
  points: Point[]
  polygons: PolygonData[]
  polygonsMultiColors?: boolean
  polygonsTitle?: boolean
  polygonsFitBounds?: boolean
  clickOnPolygon?: (polygon: PolygonData) => void
  selectedCampaign: CampaignData | null
  modeView?: "contribuitor-view" | "admin-view"
  showMapControl?: boolean
}

type ContextType = {
  mapCenter: [number, number]
  position: { lat: number; lng: number } | null
  isTracking: boolean
}

export const useContextMapping = ():
  | DashboardContextType
  | AdminContextType
  | ContextType => {
  const router = useRouter()

  const isDashboard = router.pathname.startsWith("/dashboard")
  const isAdmin = router.pathname.startsWith("/admin")

  if (isAdmin) {
    return useAdmin()
  }

  if (isDashboard) {
    return useDashboard()
  }

  return {
    mapCenter: [0, 0],
    position: null,
    isTracking: false
  }
}

const colors = [
  { border: "blue", fill: "lightblue" },
  { border: "red", fill: "pink" },
  { border: "green", fill: "lightgreen" },
  { border: "purple", fill: "plum" },
  { border: "orange", fill: "peachpuff" }
]

const Routing = ({ map, start, end }) => {
  const routingControlRef = useRef(null) // Para almacenar el control de rutas actual

  useEffect(() => {
    // Verificar si el mapa está inicializado
    if (!map) {
      console.error(
        "El mapa no está inicializado. No se puede agregar el control de rutas."
      )
      return
    }

    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current)
      } catch (error) {
        console.error(
          "Error al intentar eliminar el control de rutas previo:",
          error
        )
      }
      routingControlRef.current = null 
    }

    try {
      const newRoutingControl = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: "#FF0000", opacity: 1, weight: 5 }]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false
      })
        .on("routesfound", e => {
          console.log("Rutas encontradas:", e.routes)
        })
        .on("routingerror", e => {
          console.error("Error al calcular la ruta:", e)
        })
        .addTo(map)

      routingControlRef.current = newRoutingControl
    } catch (error) {
      console.error("Error al inicializar el control de rutas:", error)
    }

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current)
        } catch (error) {
          console.error(
            "Error al intentar eliminar el control de rutas en limpieza:",
            error
          )
        }
        routingControlRef.current = null
      }
    }
  }, [map, start, end]) 

  return null
}

export default function Map({
  showMyLocation = false,
  points = [],
  polygons = [],
  polygonsMultiColors = true,
  polygonsTitle = false,
  polygonsFitBounds = false,
  clickOnPolygon = undefined,
  selectedCampaign,
  modeView = "contribuitor-view",
  showMapControl = false
}: MapProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const { mapCenter, position, isTracking } = useContextMapping(router)
  const mapRef = useRef<L.Map | null>(null)
  const [campaignData, setCampaignData] = useState<any>(null)
  const [selectedPoi, setSelectedPoi] = useState<any>(null)
  const [errorPoi, setErrorPoi] = useState<any>(null)
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonData | null>(
    null
  )

  const createCustomIcon = (color: string, size: number) => {
    const markerHtml = ReactDOMServer.renderToString(
      <CustomMarker markerColor={color} size={size} />
    )

    return L.divIcon({
      html: markerHtml,
      className: "custom-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size]
    })
  }

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!selectedCampaign) return
      const res = await fetch(`/api/campaigns/${selectedCampaign?.id}`)
      const resJson = await res.json()
      setCampaignData(resJson)
    }

    fetchCampaignData()
  }, [selectedCampaign])

  const markerIcon = useMemo(() => {
    if (isTracking) {
      return new DivIcon({
        className: "blinking-marker-icon",
        html: `
          <div class="blinking-marker">
            <div class="inner-circle"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    } else {
      return new DivIcon({
        className: "static-marker-icon",
        html: `
          <div class="static-marker">
            <div class="inner-circle"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }
  }, [isTracking])

  const firstDivClassName =
    modeView === "contribuitor-view" ? "h-[calc(100vh-4rem)]" : "h-96"

  const secondDivClassName =
    modeView === "contribuitor-view"
      ? `${selectedPoi ? "h-[70%]" : "h-full"} transition-all duration-300`
      : "h-full"

  const checkTaskAndPoi = (poi: PointOfInterest) => {
    /*
 {
    "poi": {
        "id": "162b3f36-7187-4748-a326-0b0de6ae7fac",
        "name": "test",
        "description": "",
        "radius": 20,
        "areaId": "d82d77a2-edaa-4319-8fda-2ccaf23883f2",
        "latitude": 43.34074929895169,
        "longitude": -3.004855556435073,
        "isDisabled": false,
        "createdAt": "2025-01-15T10:37:25.272Z",
        "updatedAt": "2025-01-16T10:01:12.253Z",
        "tasks": [
            {
                "id": "f26d3065-4a62-41f3-abcd-80cbcb7959d4",
                "title": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "description": "test",
                "type": "form",
                "taskData": {
                    "pages": [
                        {
                            "name": "page1",
                            "elements": [
                                {
                                    "name": "question1",
                                    "type": "text",
                                    "title": "this is a question 122222222222222"
                                }
                            ]
                        }
                    ]
                },
                "responseLimit": null,
                "responseLimitInterval": null,
                "availableFrom": null,
                "availableTo": null,
                "isDisabled": false,
                "pointOfInterestId": "162b3f36-7187-4748-a326-0b0de6ae7fac",
                "createdAt": "2025-01-16T11:18:56.223Z",
                "updatedAt": "2025-01-16T13:07:55.982Z"
            }
        ]
    }
}
  */
    console.log("********** CHECK POI")

  }
  checkTaskAndPoi(selectedPoi)
  return (
    <>
      <div className={firstDivClassName} data-cy='map-container-for-dashboard'>
        <div className={secondDivClassName}>
          <LeafletMapContainer
            center={mapCenter || [0, 0]}
            zoom={mapCenter ? 16 : 13}
            style={{ height: "100%", width: "100%" }}
            data-cy='map-container-for-dashboard'
            whenReady={event => {
              mapRef.current = event.target
            }}
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {showMapControl && (
              <MapControls position={position} campaignData={campaignData} />
            )}
            {polygons?.map((polygon, index) => {
              if (polygonsMultiColors) {
                const color = colors[index % colors.length]
                return (
                  <Polygon
                    key={polygon.id}
                    positions={polygon.polygon}
                    pathOptions={{
                      color: color.border,
                      fillColor: color.fill,
                      fillOpacity: 0.5
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedPolygon(polygon)
                        if (clickOnPolygon) clickOnPolygon(polygon)
                      }
                    }}
                  >
                    {polygonsTitle && <Tooltip>{polygon.name}</Tooltip>}
                    {selectedPolygon?.id === polygon.id && (
                      <Popup>
                        <div>
                          <h3>
                            <strong></strong>
                            {polygon.name}
                          </h3>
                          <p>
                            <strong>Description:</strong>
                            {polygon.description}
                          </p>
                          <button
                            onClick={() => {
                              router.push(`/admin/areas/${polygon.id}`)
                            }}
                            className='text-blue-600 underline'
                          >
                            {t("See more")}
                          </button>
                        </div>
                      </Popup>
                    )}
                  </Polygon>
                )
              }
              return (
                <Polygon
                  key={index}
                  positions={polygon.coordinates}
                  pathOptions={{ color: "blue", weight: 2 }}
                />
              )
            })}
            {points?.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={L.icon({
                  iconUrl: "/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41]
                })}
              />
            ))}
            {campaignData?.areas?.map(
              (area: {
                id: string
                name: string
                description: string
                polygon: [number, number][]
                pointOfInterests: any[]
              }) => (
                <Polygon
                  key={area.id}
                  positions={area.polygon}
                  pathOptions={{ color: "blue", weight: 2 }}
                >
                  <Popup>
                    <h3>{area.name}</h3>
                    <p>{area.description}</p>
                  </Popup>
                </Polygon>
              )
            )}
            {campaignData?.areas
              ?.flatMap(
                (area: { pointOfInterests: any }) => area?.pointOfInterests
              )
              .map((poi: PointOfInterest) => (
                <>
                  <Circle
                    key={`${poi.id}-circle`}
                    center={[poi.latitude, poi.longitude]}
                    radius={poi.radius}
                    pathOptions={{ color: "green", fillOpacity: 0.2 }}
                    eventHandlers={{
                      click: () => {
                        if (selectedPoi) {
                          setSelectedPoi(null)
                          return
                        }
                        setSelectedPoi(poi)
                      }
                    }}
                  />
                  <Marker
                    key={poi.id}
                    position={[poi.latitude, poi.longitude]}
                    icon={createCustomIcon("green", 36)}
                    eventHandlers={{
                      click: () => {
                        if (selectedPoi) {
                          setSelectedPoi(null)
                          return
                        }
                        setSelectedPoi(poi)
                      }
                    }}
                  ></Marker>
                </>
              ))}
            {showMyLocation && position && (
              <Marker position={[position.lat, position.lng]} icon={markerIcon}>
                <Popup>
                  <h3>{t("Your current location")}</h3>
                </Popup>
              </Marker>
            )}
            {polygonsFitBounds && <FitBounds polygons={polygons} />}
            {selectedPoi && position && mapRef.current && (
              <Routing
                map={mapRef.current}
                start={{ lat: position.lat, lng: position.lng }}
                end={{ lat: selectedPoi.latitude, lng: selectedPoi.longitude }}
              />
            )}
          </LeafletMapContainer>
        </div>
        {selectedPoi && (
          <div className='h-[30%] overflow-y-auto bg-white dark:bg-gray-900 shadow-lg rounded-t-lg p-3'>
            <span className='justify-between flex items-center'>
              {" "}
              <h4
                className='text-lg font-bold text-gray-900 dark:text-slate-100'
                data-cy='poi-name'
              >
                {selectedPoi.name}{" "}
                {errorPoi && (
                  <span className='text-red-500'>{t(errorPoi)}</span>
                )}
              </h4>
              {/* <h5 className='text-sm text-gray-500 dark:text-gray-400'>
                <button
                  onClick={generateRoute}
                  className='mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-400 text-center'
                >
                  {t("Generate Route")}
                </button>
              </h5> */}
            </span>

            {selectedPoi.tasks.length > 0 && (
              <div className='mt-2'>
                <h4
                  data-cy='poi-tasks-title'
                  className='text-md font-semibold text-gray-900 dark:text-slate-100'
                >
                  {t("Tasks")}
                </h4>

                <div className='relative'>
                  <button
                    className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow focus:outline-none'
                    onClick={() => {
                      const container =
                        document.getElementById("tasks-container")
                      container?.scrollBy({ left: -300, behavior: "smooth" })
                    }}
                  >
                    ←
                  </button>

                  <div
                    id='tasks-container'
                    className='flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth snap-x'
                  >
                    {selectedPoi.tasks.map((task: Task) => (
                      <div
                        key={task.id}
                        className='min-w-[300px] snap-start flex-shrink-0 p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700'
                      >
                        <h5
                          className='text-md font-semibold text-gray-900 dark:text-slate-100 truncate'
                          data-cy={`task-title-${task.id}`}
                        >
                          {task.title}
                        </h5>
                        <p
                          className='text-sm text-gray-600 dark:text-gray-400 mt-1 truncate'
                          data-cy={`task-description-${task.id}`}
                        >
                          {task.description || t("No description available")}
                        </p>
                        <button
                          onClick={() =>
                            (window.location.href = `/dashboard/task/${task.id}`)
                          }
                          className='mt-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-400 text-center'
                          data-cy={`enter-task-${task.id}`}
                        >
                          {t("Enter Task")}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow focus:outline-none'
                    onClick={() => {
                      const container =
                        document.getElementById("tasks-container")
                      container?.scrollBy({ left: 300, behavior: "smooth" })
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
