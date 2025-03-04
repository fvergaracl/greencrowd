import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState, useRef, use } from "react";
import ReactDOMServer from "react-dom/server";
import {
  MapContainer as LeafletMapContainer,
  Circle,
  Tooltip,
  TileLayer,
  Marker,
  Polygon,
  Popup,
} from "react-leaflet";
import L, { DivIcon } from "leaflet";
import "leaflet-routing-machine";
import LeafletRoutingMachine from "leaflet-routing-machine";
import CustomMarker from "../Mapmarker";
import DistanceIndicator from "./DistanceIndicator";
import "leaflet/dist/leaflet.css";
import { useDashboard, DashboardContextType } from "@/context/DashboardContext";
import { useAdmin, AdminContextType } from "@/context/AdminContext";
import MapControls from "./MapControls";
import { useTranslation } from "@/hooks/useTranslation";
import FitBounds from "./FitBounds";
import "../styles.css";
import { logEvent } from "@/utils/logger";
import { getApiBaseUrl, getApiGameBaseUrl } from "@/config/api";
import Cookies from "js-cookie";
import { getDeviceHeading } from "@/utils/getDeviceHeading";
import Lottie from "lottie-react";
import MapLocationNeeded from "@/lotties/map_location_needed.json";
import GamificationCircle from "./GamificationCircle";
import TaskList from "./TaskList";

import {
  Point,
  Task,
  PolygonData,
  CampaignData,
  PointOfInterest,
} from "./types";

interface MapProps {
  showMyLocation?: boolean;
  points: Point[];
  polygons: PolygonData[];
  polygonsMultiColors?: boolean;
  polygonsTitle?: boolean;
  polygonsFitBounds?: boolean;
  clickOnPolygon?: (polygon: PolygonData) => void;
  selectedCampaign: CampaignData | null;
  modeView?: "contribuitor-view" | "admin-view";
  showMapControl?: boolean;
}

type ContextType = {
  mapCenter: [number, number];
  position: { lat: number; lng: number } | null;
  isTracking: boolean;
};

type Dimension = { [key: string]: number };
type TaskPreProccess = {
  externalTaskId: string;
  totalSimulatedPoints: number;
  dimensions: Dimension[];
};

type ProcessedPOI = {
  poiId: string;
  averagePoints: number;
  normalizedScore: number;
};

const processTasks = (
  data: { tasks: TaskPreProccess[] },
  mode: string = "all"
) => {
  const poiMap: Record<string, { total: number; count: number }> = {};

  data.tasks.forEach((task) => {
    const match = task.externalTaskId.match(/POI_([^_]+)_Task/);
    if (match) {
      const poiId = match[1];

      let pointsToCount = 0;
      if (mode === "all") {
        pointsToCount = task.totalSimulatedPoints;
      } else {
        const dimension = task.dimensions.find(
          (dim) => dim[mode] !== undefined
        );
        if (dimension) {
          pointsToCount = dimension[mode];
        }
      }

      if (!poiMap[poiId]) {
        poiMap[poiId] = { total: 0, count: 0 };
      }
      poiMap[poiId].total += pointsToCount;
      poiMap[poiId].count += 1;
    }
  });

  const poiList: ProcessedPOI[] = Object.entries(poiMap).map(
    ([poiId, values]) => ({
      poiId,
      averagePoints: values.total / values.count,
      normalizedScore: 0,
    })
  );

  const minPoints = Math.min(...poiList.map((poi) => poi.averagePoints));
  const maxPoints = Math.max(...poiList.map((poi) => poi.averagePoints));

  poiList.forEach((poi) => {
    if (maxPoints !== minPoints) {
      poi.normalizedScore = Math.round(
        1 + (poi.averagePoints - minPoints) * (9 / (maxPoints - minPoints))
      );
    } else {
      poi.normalizedScore = 1;
    }
  });

  return JSON.stringify(poiList, null, 2);
};

const decodeToken = (token: string): { roles?: string[] } | null => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload;
  } catch {
    console.error("Invalid token format");
    return null;
  }
};

export const useContextMapping = ():
  | DashboardContextType
  | AdminContextType
  | ContextType => {
  const router = useRouter();

  const isDashboard = router.pathname.startsWith("/dashboard");
  const isAdmin = router.pathname.startsWith("/admin");

  if (isAdmin) {
    return useAdmin();
  }

  if (isDashboard) {
    return useDashboard();
  }

  return {
    mapCenter: [0, 0],
    position: null,
    isTracking: false,
  };
};

const colors = [
  { border: "blue", fill: "lightblue" },
  { border: "red", fill: "pink" },
  { border: "green", fill: "lightgreen" },
  { border: "purple", fill: "plum" },
  { border: "orange", fill: "peachpuff" },
];
const Routing = ({ map, start, end, routingControlRef }) => {
  useEffect(() => {
    if (!map || !start || !end) return;

    if (routingControlRef.current) {
      routingControlRef.current
        .getPlan()
        .setWaypoints([
          L.latLng(start.lat, start.lng),
          L.latLng(end.lat, end.lng),
        ]);
      return;
    }

    try {
      routingControlRef.current = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        router: new L.Routing.OSRMv1({
          serviceUrl: "https://routing.openstreetmap.de/routed-foot/route/v1",
          profile: "driving",
        }),
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: "#FF0000", opacity: 1, weight: 5 }],
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null,
      }).addTo(map);
    } catch (error) {
      console.error("Error al inicializar la ruta:", error);
    }

    return () => {};
  }, [map, start, end]);

  return null;
};

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
  showMapControl = false,
}: MapProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const { mapCenter, position, isTracking, positionFullDetails } =
    useContextMapping();
  const mapRef = useRef<L.Map | null>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [errorPoi, setErrorPoi] = useState<any>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonData | null>(
    null
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lastFetchToken, setLastFetchToken] = useState<Date | null>(null);
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [gamificationDataNormalized, setGamificationDataNormalized] =
    useState<any>(null);
  const [lastFetchGamificationData, setLastFetchGamificationData] =
    useState<Date | null>(null);

  const [gamificationFilter, setGamificationFilter] = useState<string>("all");

  /*
  campaignData = {
    "id": "2f41f86e-2a1c-4583-b076-048dabb8e5e9",
    "name": "test",
    "description": "",
    "isOpen": true,
    "location": "",
    "startDatetime": null,
    "endDatetime": null,
    "category": "asdasdsa",
    "gameId": "8e9ebc36-2e17-4794-8a1b-1111dd44680a",
    "isDisabled": false,
    "createdAt": "2025-02-18T11:38:24.906Z",
    "updatedAt": "2025-02-25T10:24:40.599Z",
    "areas": [
        {
            "id": "4adf38d8-db10-4380-bb2c-a2bd4122be7f",
            "name": "Left side",
            "description": "",
            "campaignId": "2f41f86e-2a1c-4583-b076-048dabb8e5e9",
            "polygon": [
                [
                    43.2728465826415,
                    -2.942441131757652
                ],
                [
                    43.2734402644482,
                    -2.941669292692671
                ],
                [
                    43.27415892414971,
                    -2.939761135004233
                ],
                [
                    43.27365898786447,
                    -2.938174576926198
                ],
                [
                    43.27011244693973,
                    -2.938474736562585
                ],
                [
                    43.26939373945454,
                    -2.942333931887511
                ],
                [
                    43.27022181472609,
                    -2.942226732017371
                ],
                [
                    43.2706592839063,
                    -2.942140972121266
                ],
                [
                    43.27100300748489,
                    -2.94184081248488
                ],
                [
                    43.27154983645013,
                    -2.942162412095302
                ],
                [
                    43.27161233087617,
                    -2.942419691783636
                ],
                [
                    43.27186230793865,
                    -2.942912811186247
                ]
            ],
            "isDisabled": false,
            "createdAt": "2025-02-19T10:40:17.036Z",
            "updatedAt": "2025-02-19T10:40:17.036Z",
            "pointOfInterests": [
                {
                    "id": "e2f58b8e-a3d8-452a-a5b6-3d28172895c0",
                    "name": "Behind Eside Building",
                    "description": "",
                    "radius": 20,
                    "areaId": "4adf38d8-db10-4380-bb2c-a2bd4122be7f",
                    "latitude": 43.27203416657349,
                    "longitude": -2.939679622650147,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:41:59.955Z",
                    "updatedAt": "2025-02-19T10:41:59.955Z",
                    "tasks": [
                        {
                            "id": "10fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "e2f58b8e-a3d8-452a-a5b6-3d28172895c0",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "d8fd6554-a140-42ff-8d73-fa314c0358bd",
                    "name": "bus stop",
                    "description": "",
                    "radius": 20,
                    "areaId": "4adf38d8-db10-4380-bb2c-a2bd4122be7f",
                    "latitude": 43.27106940840702,
                    "longitude": -2.941305041313172,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:44:14.655Z",
                    "updatedAt": "2025-02-19T10:44:14.655Z",
                    "tasks": [
                        {
                            "id": "30fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "d8fd6554-a140-42ff-8d73-fa314c0358bd",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "3e134cfc-75a2-4e21-85e9-89983d98a819",
                    "name": "Rotonda",
                    "description": "",
                    "radius": 20,
                    "areaId": "4adf38d8-db10-4380-bb2c-a2bd4122be7f",
                    "latitude": 43.27034290026031,
                    "longitude": -2.939180731773377,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:44:35.240Z",
                    "updatedAt": "2025-02-19T10:44:35.240Z",
                    "tasks": [
                        {
                            "id": "40fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "3e134cfc-75a2-4e21-85e9-89983d98a819",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "6623df1a-2486-40af-90f7-96b6bccde472",
                    "name": "Sports fields",
                    "description": "",
                    "radius": 60,
                    "areaId": "4adf38d8-db10-4380-bb2c-a2bd4122be7f",
                    "latitude": 43.27179981376928,
                    "longitude": -2.940795421600342,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:43:35.420Z",
                    "updatedAt": "2025-02-19T10:43:35.420Z",
                    "tasks": [
                        {
                            "id": "20fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "6623df1a-2486-40af-90f7-96b6bccde472",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                }
            ]
        },
        {
            "id": "f73df3de-a352-4b7f-af8e-d6d04cd51fbd",
            "name": "Right side",
            "description": "",
            "campaignId": "2f41f86e-2a1c-4583-b076-048dabb8e5e9",
            "polygon": [
                [
                    43.27369023400261,
                    -2.938131696978146
                ],
                [
                    43.27017494284171,
                    -2.93838897666648
                ],
                [
                    43.27023743867951,
                    -2.937038258302763
                ],
                [
                    43.26926874598212,
                    -2.937295537991076
                ],
                [
                    43.26894063689573,
                    -2.937295537991076
                ],
                [
                    43.26801879714021,
                    -2.937445617809269
                ],
                [
                    43.26798754809029,
                    -2.936395059081938
                ],
                [
                    43.26864377476972,
                    -2.936373619107902
                ],
                [
                    43.26950310853235,
                    -2.936673778744288
                ],
                [
                    43.27025306262895,
                    -2.936416499055954
                ],
                [
                    43.26990933481506,
                    -2.932900343315466
                ],
                [
                    43.27050304527434,
                    -2.932643063627152
                ],
                [
                    43.27095613620211,
                    -2.935408820276675
                ],
                [
                    43.27375272623079,
                    -2.935280180432518
                ]
            ],
            "isDisabled": false,
            "createdAt": "2025-02-19T10:41:16.423Z",
            "updatedAt": "2025-02-19T10:41:16.423Z",
            "pointOfInterests": [
                {
                    "id": "a908261b-2a21-41ef-a1f1-eb4e3eccde15",
                    "name": "Parking",
                    "description": "",
                    "radius": 20,
                    "areaId": "f73df3de-a352-4b7f-af8e-d6d04cd51fbd",
                    "latitude": 43.2707061554177,
                    "longitude": -2.938333153724671,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:44:57.983Z",
                    "updatedAt": "2025-02-19T10:44:57.983Z",
                    "tasks": [
                        {
                            "id": "50fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "a908261b-2a21-41ef-a1f1-eb4e3eccde15",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "867a3095-e40c-4fdd-93f1-99f94596e9ab",
                    "name": "Inside Main building",
                    "description": "",
                    "radius": 50,
                    "areaId": "f73df3de-a352-4b7f-af8e-d6d04cd51fbd",
                    "latitude": 43.27083895783726,
                    "longitude": -2.937544584274292,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:45:54.452Z",
                    "updatedAt": "2025-02-19T10:45:54.452Z",
                    "tasks": [
                        {
                            "id": "60fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "867a3095-e40c-4fdd-93f1-99f94596e9ab",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "db490f8d-961e-4781-a201-44ad1e844bfa",
                    "name": "Bridge Pedro Arrupe",
                    "description": "",
                    "radius": 20,
                    "areaId": "f73df3de-a352-4b7f-af8e-d6d04cd51fbd",
                    "latitude": 43.27026087460217,
                    "longitude": -2.936729192733765,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:46:27.296Z",
                    "updatedAt": "2025-02-19T10:46:27.296Z",
                    "tasks": [
                        {
                            "id": "70fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "db490f8d-961e-4781-a201-44ad1e844bfa",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "239b1cd2-4d6b-4e3e-980c-3f1c98b2838d",
                    "name": "Deusto Library",
                    "description": "",
                    "radius": 20,
                    "areaId": "f73df3de-a352-4b7f-af8e-d6d04cd51fbd",
                    "latitude": 43.26844846994983,
                    "longitude": -2.937018871307373,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:46:54.665Z",
                    "updatedAt": "2025-02-19T10:46:54.665Z",
                    "tasks": [
                        {
                            "id": "80fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "239b1cd2-4d6b-4e3e-980c-3f1c98b2838d",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                },
                {
                    "id": "a5bca879-3b11-4fc6-880b-b3d8b8aba839",
                    "name": "Tranvia Stop",
                    "description": "",
                    "radius": 20,
                    "areaId": "f73df3de-a352-4b7f-af8e-d6d04cd51fbd",
                    "latitude": 43.26869064783323,
                    "longitude": -2.936675548553467,
                    "isDisabled": false,
                    "createdAt": "2025-02-19T10:47:13.467Z",
                    "updatedAt": "2025-02-19T10:47:13.467Z",
                    "tasks": [
                        {
                            "id": "90fcb063-5e3d-48c5-9532-259aaba7d03a",
                            "title": "knowing the environment",
                            "description": "-",
                            "type": "form",
                            "taskData": {
                                "pages": [
                                    {
                                        "name": "page1",
                                        "title": "General Questions",
                                        "elements": [
                                            {
                                                "name": "q1_environment_quality",
                                                "type": "rating",
                                                "title": "How would you describe the environment in this point?",
                                                "isRequired": true,
                                                "maxRateDescription": "🟢 Clean and well-maintained",
                                                "minRateDescription": "🔴 Polluted and needs improvement"
                                            },
                                            {
                                                "name": "q2_common_issues",
                                                "type": "checkbox",
                                                "title": "What are the most common environmental issues you notice? (Select all that apply)",
                                                "choices": [
                                                    {
                                                        "text": "🗑️ Litter and waste",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "🚗 Air pollution",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "💧 Water pollution",
                                                        "value": "Item 3"
                                                    },
                                                    {
                                                        "text": "🌲 Deforestation",
                                                        "value": "Item 4"
                                                    },
                                                    {
                                                        "text": "🔊 Noise pollution",
                                                        "value": "Item 5"
                                                    }
                                                ],
                                                "isRequired": true,
                                                "showNoneItem": true,
                                                "showOtherItem": true,
                                                "showSelectAllItem": true
                                            },
                                            {
                                                "name": "q3_public_space_satisfaction",
                                                "type": "rating",
                                                "title": "On a scale of 1-5, how satisfied are you with the public spaces in your area?",
                                                "rateType": "stars",
                                                "isRequired": true,
                                                "maxRateDescription": "Very satisfied",
                                                "minRateDescription": "Very dissatisfied"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page2",
                                        "title": "Upload a Photo",
                                        "elements": [
                                            {
                                                "name": "q4_upload_photo",
                                                "type": "file",
                                                "title": "Please upload a photo that represents the current environmental condition in your area.",
                                                "isRequired": true,
                                                "sourceType": "file-camera",
                                                "acceptedTypes": "image/*\t",
                                                "waitForUpload": true,
                                                "needConfirmRemoveFile": true
                                            }
                                        ]
                                    },
                                    {
                                        "name": "page3",
                                        "title": "Suggestions for Improvement",
                                        "elements": [
                                            {
                                                "name": "q5_suggestions_for_improvement",
                                                "type": "text",
                                                "title": "What actions do you think would improve the environment in your area?"
                                            },
                                            {
                                                "name": "question1",
                                                "type": "dropdown",
                                                "title": "Would you be willing to participate in community-driven environmental initiatives?",
                                                "choices": [
                                                    {
                                                        "text": "✅ Yes",
                                                        "value": "Item 1"
                                                    },
                                                    {
                                                        "text": "❌ No",
                                                        "value": "Item 2"
                                                    },
                                                    {
                                                        "text": "🤔 Maybe, I need more information",
                                                        "value": "Item 3"
                                                    }
                                                ],
                                                "isRequired": true
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
                            "pointOfInterestId": "a5bca879-3b11-4fc6-880b-b3d8b8aba839",
                            "createdAt": "2025-02-17T13:57:48.125Z",
                            "updatedAt": "2025-02-17T13:57:48.125Z"
                        }
                    ]
                }
            ]
        }
    ],
    "allowedUsers": [
        {
            "id": "1c6997d8-10f7-40c4-a531-3f9663cd973b",
            "userId": "9d541c5c-807f-4aac-abb0-05fcc78de808",
            "campaignId": "2f41f86e-2a1c-4583-b076-048dabb8e5e9",
            "accessType": "contributor",
            "createdAt": "2025-03-04T15:26:18.155Z",
            "updatedAt": "2025-03-04T15:26:18.155Z"
        }
    ]
}
  */

  /*
useEffect(() => {
    const fetchCampaignData = async () => {
      if (!selectedCampaign) return;
      const res = await fetch(
        `${getApiBaseUrl()}/campaigns/${selectedCampaign?.id}`
      );
      const resJson = await res.json();
      setCampaignData(resJson);
    };

    fetchCampaignData();
  }, [selectedCampaign]);
    */
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) =>
    cookie.startsWith("access_token=")
  );
  tokenCookie ? tokenCookie.split("=")[1] : null;

  useEffect(() => {
    if (!isTracking) {
      console.log("No gamification data for non-tracking users");
      return;
    }
    if (!selectedCampaign) {
      console.error("No gamification data for doesn't selected campaign");
      return;
    }
    if (!campaignData) {
      console.error("No gamification data for doesn't selected campaign...");
      return;
    }
    if (!accessToken) {
      console.error("No access token for gamification data");
      return;
    }
    const fetchGamificationData = async () => {
      const decodedToken = decodeToken(accessToken);
      console.log("Decoded Token:", decodedToken);
      const res = await fetch(
        `${getApiGameBaseUrl()}/games/${campaignData?.gameId}/users/${decodedToken?.sub}/points/simulated`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const resJson = await res.json();
      setGamificationData(resJson);
      console.log("-------------------------");
      console.log("-------------*------------");
      console.log("-------------------------");
      console.log("-------------*------------");
      console.log("-------------------------");
      console.log("-------------*------------");
      console.log("Gamification Data:", resJson);
      const normalized = processTasks(resJson);
      console.log("Normalized Gamification Data:", normalized);

      setGamificationDataNormalized(normalized);
      setLastFetchGamificationData(new Date());
    };

    const fetchGamificationDataInterval = 5 * 60 * 1000; // 5 minute in milliseconds

    if (
      !lastFetchGamificationData ||
      new Date().getTime() - lastFetchGamificationData.getTime() >
        fetchGamificationDataInterval
    ) {
      fetchGamificationData();
    }

    // Set up interval to refresh gamification data every 5 minutes
    const interval = setInterval(() => {
      fetchGamificationData();
    }, fetchGamificationDataInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [accessToken, campaignData, lastFetchGamificationData, isTracking]);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch token");

        const { access_token } = await response.json();
        setLastFetchToken(new Date()); // Update last fetch time
        setAccessToken(access_token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    const fetchTokenInterval = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (
      !lastFetchToken ||
      new Date().getTime() - lastFetchToken.getTime() > fetchTokenInterval
    ) {
      fetchToken();
    }

    // Set up interval to refresh token every 15 minutes
    const interval = setInterval(() => {
      fetchToken();
    }, fetchTokenInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [router.isReady, lastFetchToken]);

  useEffect(() => {
    if (!isTracking) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const heading = await getDeviceHeading();
        if (isMounted) setHeading(heading);
      } catch (error) {
        console.error("Error getting device heading:", error);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isTracking, positionFullDetails]);

  const removeRoute = (logEventShouldBeLogged = true) => {
    if (logEventShouldBeLogged) {
      logEvent(
        "USER_SELECTED_POI_REMOVED_ROUTE_MAP",
        `User removed the route in the map`,
        {
          poi: selectedPoi,
        }
      );
    }
    setSelectedPoi(null);

    if (routingControlRef.current) {
      try {
        if (routingControlRef.current) {
          routingControlRef.current.getPlan().setWaypoints([]);
        }
      } catch (error) {
        console.error("Error al limpiar la ruta:", error);
      }
    }
  };

  const createCustomIcon = (color: string, size: number) => {
    const markerHtml = ReactDOMServer.renderToString(
      <CustomMarker markerColor={color} size={size} />
    );

    return L.divIcon({
      html: markerHtml,
      className: "custom-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  };

  const handleSelectPoi = (poi: PointOfInterest | null) => {
    console.log({ poi });

    logEvent(
      poi ? "USER_SELECTED_POI_IN_MAP" : "USER_UNSELECTED_POI_IN_MAP",
      `User selected a point of interest in the map with id: ${poi?.id}`,
      { poi }
    );
    setSelectedPoi(poi);
  };

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!selectedCampaign) return;
      const res = await fetch(
        `${getApiBaseUrl()}/campaigns/${selectedCampaign?.id}`
      );
      const resJson = await res.json();
      setCampaignData(resJson);
    };

    fetchCampaignData();
  }, [selectedCampaign]);

  const markerIcon = useMemo(() => {
    if (isTracking) {
      return new DivIcon({
        className: "blinking-marker-container",
        html: `
          <div class="rotating-wrapper" style="transform: rotate(${heading}deg); transform-origin: center;">
            <div class="blinking-marker">
              <div class="inner-circle"></div>
              <div class="arrow"></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    } else {
      return new DivIcon({
        className: "static-marker-icon",
        html: `
          <div class="static-marker">
            <div class="inner-circle"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
    }
  }, [isTracking, positionFullDetails]);

  useEffect(() => {
    if (selectedPoi) {
      checkTaskAndPoi(selectedPoi);
    }
  }, [selectedPoi]);

  const firstDivClassName =
    modeView === "contribuitor-view" ? "h-[calc(100vh-4rem)]" : "h-96";

  const secondDivClassName =
    modeView === "contribuitor-view"
      ? `${selectedPoi ? "h-[70%]" : "h-full"} transition-all duration-300`
      : "h-full";

  const checkTaskAndPoi = (poi: PointOfInterest) => {
    const destination = L.latLng(poi.latitude, poi.longitude);

    const distance = mapRef.current?.distance(
      L.latLng(position.lat, position.lng),
      destination
    );

    if (distance && distance <= poi.radius) {
      if (poi.tasks.length > 0) {
        handleSelectPoi(poi);
      } else {
        setErrorPoi("This point of interest has no tasks");
      }
    } else {
      setErrorPoi("You are not close enough to this point of interest");
    }
  };
  if (!isTracking) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center"
        data-cy="map-container-for-dashboard"
      >
        <div className="flex justify-center">
          <Lottie
            animationData={MapLocationNeeded}
            loop={true}
            className="max-w-[300px] w-full"
          />
        </div>
        <h2 className="text-center text-2xl">
          {t("Please enable location services to see the map")}
        </h2>
      </div>
    );
  }
  return (
    <>
      <div className={firstDivClassName} data-cy="map-container-for-dashboard">
        <div className={secondDivClassName}>
          <div className="absolute top-4 right-4 z-99999">
            <GamificationCircle />
          </div>
          <LeafletMapContainer
            center={mapCenter || [0, 0]}
            zoom={mapCenter ? 16 : 13}
            style={{ height: "100%", width: "100%" }}
            data-cy="map-container-for-dashboard"
            whenReady={(event) => {
              mapRef.current = event.target;
            }}
          >
            {selectedPoi && position && (
              <DistanceIndicator
                poi={selectedPoi}
                position={position}
                onRadiusChange={(isInside) => {
                  if (isInside) {
                    setErrorPoi(null);
                  }
                }}
              />
            )}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {showMapControl && isTracking && (
              <MapControls
                position={position}
                removeRoute={selectedPoi && removeRoute}
                campaignData={campaignData}
              />
            )}
            {isTracking &&
              polygons?.map((polygon, index) => {
                if (polygonsMultiColors) {
                  const color = colors[index % colors.length];
                  return (
                    <Polygon
                      key={polygon.id}
                      positions={polygon.polygon}
                      pathOptions={{
                        color: color.border,
                        fillColor: color.fill,
                        fillOpacity: 0.5,
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedPolygon(polygon);
                          if (clickOnPolygon) clickOnPolygon(polygon);
                        },
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
                                router.push(`/admin/areas/${polygon.id}`);
                              }}
                              className="text-blue-600 underline"
                            >
                              {t("See more")}
                            </button>
                          </div>
                        </Popup>
                      )}
                    </Polygon>
                  );
                }
                return (
                  <Polygon
                    key={index}
                    positions={polygon.coordinates}
                    pathOptions={{ color: "blue", weight: 2 }}
                  />
                );
              })}
            {isTracking &&
              points?.map((point, index) => (
                <Marker
                  key={index}
                  position={[point.lat, point.lng]}
                  icon={L.icon({
                    iconUrl: "/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}
                />
              ))}
            {isTracking &&
              campaignData?.areas?.map(
                (area: {
                  id: string;
                  name: string;
                  description: string;
                  polygon: [number, number][];
                  pointOfInterests: any[];
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
            {isTracking &&
              campaignData?.areas
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
                          if (selectedPoi?.id === poi?.id) {
                            handleSelectPoi(null);
                          } else {
                            handleSelectPoi(poi);
                          }
                        },
                      }}
                    />
                    <Marker
                      key={poi.id}
                      position={[poi.latitude, poi.longitude]}
                      icon={createCustomIcon("green", 36)}
                      eventHandlers={{
                        click: () => {
                          if (selectedPoi) {
                            logEvent(
                              "USER_SELECTED_POI_IN_MAP_BY_MARKER",
                              `User selected a point of interest in the map with id: ${selectedPoi.id}`,
                              { poi: selectedPoi }
                            );

                            setSelectedPoi(null);
                            return;
                          }
                          handleSelectPoi(poi);
                        },
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
            {isTracking && polygonsFitBounds && (
              <FitBounds polygons={polygons} />
            )}
            {isTracking && selectedPoi && position && mapRef.current && (
              <Routing
                map={mapRef.current}
                start={{ lat: position.lat, lng: position.lng }}
                end={{ lat: selectedPoi.latitude, lng: selectedPoi.longitude }}
                routingControlRef={routingControlRef}
              />
            )}
          </LeafletMapContainer>
        </div>
        {isTracking && selectedPoi && (
          <div className="h-[30%] overflow-y-auto">
            {selectedPoi.tasks.length > 0 && (
              <TaskList
                isTracking={isTracking}
                selectedPoi={selectedPoi}
                errorPoi={errorPoi}
                logEvent={logEvent}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
