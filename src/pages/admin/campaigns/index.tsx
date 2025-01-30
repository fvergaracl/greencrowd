import React, { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import { useRouter } from "next/router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import DefaultLayout from "../../../components/AdminLayout"
import { MdCampaign } from "react-icons/md"
import { useAdmin } from "@/context/AdminContext"
import { FaDrawPolygon, FaTasks, FaUsers } from "react-icons/fa"
import { MdOutlinePinDrop } from "react-icons/md"
import ColumnSelector from "@/components/Admin/ColumnSelector"
import { useTranslation } from "@/hooks/useTranslation"
interface Campaign {
  id: string
  name: string
  description: string
  isOpen: boolean
  startDatetime: string | null
  endDatetime: string | null
  location: string | null
  category: string
  gameId: string | null
  areas: {
    id: string
    name: string
    description: string
    polygon: [number, number][]
    pointOfInterests: {
      id: string
      name: string
      latitude: number
      longitude: number
      disabled: boolean
      tasks: {
        id: string
      }[]
    }[]
    tasks: {
      id: string
    }[]
  }[]

  allowedUsers: {
    accessType: string
  }[]
  createdAt: string
  updatedAt: string
}

interface VisibleColumns {
  id: boolean
  name: boolean
  description: boolean
  location: boolean
  status: boolean
  dates: boolean
  category: boolean
  details: boolean
  actions: boolean
  createdAt: boolean
  updatedAt: boolean
  gamificated: boolean
}

export default function AdminCampaigns() {
  const { t } = useTranslation()
  const { user } = useAdmin()
  const router = useRouter()
  const { campaignId } = router.query
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState<String | String[] | undefined>(
    campaignId || ""
  )
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    id: true,
    name: true,
    description: true,
    location: false,
    status: true,
    dates: true,
    category: true,
    details: true,
    actions: true,
    createdAt: false,
    updatedAt: false,
    gamificated: false
  })

  const pageSize = 10

  useEffect(() => {
    if (campaignId && typeof campaignId === "string") {
      setSearchQuery(campaignId)
    }
  }, [campaignId])

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("/api/admin/campaigns")
        setAllCampaigns(response.data)
        setFilteredCampaigns(response.data)
      } catch (err) {
        console.error("Failed to fetch campaigns:", err)
      }
    }

    fetchCampaigns()
  }, [])

  useEffect(() => {
    if (!allCampaigns || !searchQuery) {
      setFilteredCampaigns(allCampaigns) // Si no hay búsqueda, muestra todas las campañas
      return
    }

    const lowercasedQuery = searchQuery?.toLowerCase()

    const filtered = allCampaigns?.filter(campaign => {
      const { name, description, location, category, id } = campaign

      return (
        name.toLowerCase().includes(lowercasedQuery) ||
        (description && description.toLowerCase().includes(lowercasedQuery)) ||
        (location && location.toLowerCase().includes(lowercasedQuery)) ||
        category.toLowerCase().includes(lowercasedQuery) ||
        id.toLowerCase().includes(lowercasedQuery)
      )
    })

    setFilteredCampaigns(filtered)
    setCurrentPage(1)
  }, [searchQuery, allCampaigns])

  const handleColumnToggle = (column: string) => {
    const newCampaingColumns = {
      ...visibleColumns,
      [column]: !visibleColumns[column]
    }

    setVisibleColumns(prev => newCampaingColumns)
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/admin/campaigns/${id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/campaigns/${id}/edit`)
    },
    [router]
  )

  const handleDelete = useCallback(
    (id: string) => {
      Swal.fire({
        title: t("Are you sure?"),
        text: t(
          "If you do this, you will lose all the data related to this campaign (areas, POIs, and tasks)."
        ),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: t("Yes, delete it!"),
        cancelButtonText: t("Cancel")
      }).then(async result => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`/api/admin/campaigns/${id}`)
            Swal.fire(
              t("Deleted!"),
              t("The campaign has been deleted."),
              "success"
            )
            setAllCampaigns(prev => prev.filter(campaign => campaign.id !== id))
          } catch (error) {
            console.error("Failed to delete campaign:", error)
            Swal.fire(t("Error"), t("Failed to delete the campaign."), "error")
          }
        }
      })
    },
    [t]
  )

  const handleInviteOnly = useCallback(
    (id: string) => {
      const campaignLink = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/campaigns?invite=${id}&fromuser=${user?.sub}`

      Swal.fire({
        title: t("Invite-only campaign"),
        html: `
        <p>${t("This campaign is invite-only. Share the link below")}:</p>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
          <input 
            type="text" 
            value="${campaignLink}" 
            style="width: 100%; padding: 8px; font-size: 14px;" 
            readonly
          />
          <button 
            id="copy-to-clipboard" 
            style="display: flex; align-items: center; padding: 8px; background-color: #f1f1f1; border: none; cursor: pointer;"
            title=${t("Copy to clipboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16v4a2 2 0 002 2h8a2 2 0 002-2v-4M16 12v4m-4-4v4m4-4v4m-8 0h.01M4 4h8a2 2 0 012 2v2M4 6v2m16-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h4m4-2v2m-4-2v2" /></svg>
          </button>
        </div>
      `,
        showConfirmButton: true,
        confirmButtonText: t("Close"),
        didOpen: () => {
          const copyButton = document.getElementById("copy-to-clipboard")
          if (copyButton) {
            copyButton.addEventListener("click", () => {
              navigator.clipboard.writeText(campaignLink)
              Swal.fire({
                icon: "success",
                title: t("Copied!"),
                text: t("The link has been copied to your clipboard."),
                timer: 1500,
                showConfirmButton: false
              })
            })
          }
        }
      })
    },
    [user]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handlePageChange = (direction: "prev" | "next") => {
    setCurrentPage(prev =>
      direction === "prev"
        ? Math.max(prev - 1, 1)
        : Math.min(prev + 1, Math.ceil(filteredCampaigns.length / pageSize))
    )
  }

  const startIndex = (currentPage - 1) * pageSize
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredCampaigns.slice(startIndex, startIndex + pageSize)
  }, [currentPage, filteredCampaigns])

  const isPastDeadline = (deadline: string | null) => {
    return deadline ? new Date(deadline) < new Date() : false
  }

  const groupParticipants = (allowedUsers: Campaign["allowedUsers"]) => {
    return allowedUsers.reduce((acc: Record<string, number>, user) => {
      acc[user.accessType] = (acc[user.accessType] || 0) + 1
      return acc
    }, {})
  }
  return (
    <DefaultLayout>
      <Breadcrumb
        icon={<MdCampaign />}
        pageName={t("Campaigns")}
        breadcrumbPath={t("Campaigns")}
      />
      <div className='flex justify-between gap-4 mb-4'>
        <button
          className='bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300'
          onClick={() => router.push("/admin/campaigns/create")}
        >
          {t("Create Campaign")}
        </button>
        <ColumnSelector
          visibleColumns={visibleColumns}
          onToggleColumn={handleColumnToggle}
        />
      </div>

      <div className='overflow-x-auto rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark'>
        <div className='mb-4'>
          <input
            type='text'
            placeholder={t(
              "Search by name, description, location, category, or ID"
            )}
            value={searchQuery}
            onChange={handleSearchChange}
            className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
          />
        </div>

        <table className='min-w-full table-auto border-collapse'>
          <thead>
            <tr className='bg-gray-100 text-left text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
              {visibleColumns.id && <th className='border px-2 py-2'>#</th>}
              {visibleColumns.name && (
                <th className='border px-2 py-2'>{t("Name")}</th>
              )}
              {visibleColumns.description && (
                <th className='border px-2 py-2'>{t("Description")}</th>
              )}
              {visibleColumns.location && (
                <th className='border px-2 py-2'>{t("Location")}</th>
              )}
              {visibleColumns.status && (
                <th className='border px-2 py-2'>{t("Status")}</th>
              )}
              {visibleColumns.dates && (
                <th className='border px-2 py-2'>
                  {t("Start Date / Deadline")}
                </th>
              )}
              {visibleColumns.category && (
                <th className='border px-2 py-2'>{t("Category")}</th>
              )}
              {visibleColumns.category && (
                <th className='border px-2 py-2 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    {/* Areas */}
                    <div
                      className='flex items-center gap-1'
                      title={t("Number of areas")}
                    >
                      <FaDrawPolygon className='inline-block text-blue-500' />
                      <span className='text-sm font-medium '>{t("Areas")}</span>
                    </div>
                    {/* POIs */}
                    <div
                      className='flex items-center gap-1'
                      title={t("Number of points of interest")}
                    >
                      <MdOutlinePinDrop className='inline-block text-green-500' />
                      <span className='text-sm font-medium '>{t("POIs")}</span>
                    </div>
                    {/* Tasks */}
                    <div
                      className='flex items-center gap-1'
                      title={t("Number of tasks")}
                    >
                      <FaTasks className='inline-block text-yellow-500' />
                      <span className='text-sm font-medium'>{t("Tasks")}</span>
                    </div>
                    {/* Users */}
                    <div
                      className='flex items-center gap-1'
                      title={t("Number of users")}
                    >
                      <FaUsers className='inline-block text-purple-500' />
                      <span className='text-sm font-medium'>{t("Users")}</span>
                    </div>
                  </div>
                </th>
              )}
              {visibleColumns.createdAt && (
                <th className='border px-2 py-2'>{t("Created At")}</th>
              )}
              {visibleColumns.updatedAt && (
                <th className='border px-2 py-2'>{t("Updated At")}</th>
              )}
              {visibleColumns.gamificated && (
                <th className='border px-2 py-2'>{t("Gamified")}</th>
              )}
              {visibleColumns.actions && (
                <th className='border px-2 py-2 text-center'>{t("Actions")}</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedCampaigns?.map((campaign, index) => {
              console.log({ campaign })

              /*
{
    "id": "e2f3b95b-e538-4491-9b73-7dce2af06064",
    "name": "TEST",
    "description": "Thematic co-exploration",
    "isOpen": false,
    "location": "Bilbao",
    "startDatetime": "2025-01-16T12:11:00.000Z",
    "endDatetime": null,
    "category": "category test",
    "gameId": "5d2ad1a6-bd77-4701-9001-412ec8cc2a0b",
    "isDisabled": false,
    "createdAt": "2025-01-13T11:11:11.165Z",
    "updatedAt": "2025-01-30T08:56:11.316Z",
    "areas": [
        {
            "id": "8a47a2bc-579b-4b40-9a56-072ac7256dfb",
            "name": "test2",
            "description": "test",
            "campaignId": "e2f3b95b-e538-4491-9b73-7dce2af06064",
            "polygon": [
                [
                    43.34115600131089,
                    -3.010413757783731
                ],
                [
                    43.33790984952216,
                    -3.008180325175674
                ],
                [
                    43.34003235302411,
                    -3.00457247250114
                ],
                [
                    43.34315354691834,
                    -3.007321312634115
                ]
            ],
            "isDisabled": false,
            "createdAt": "2025-01-13T16:16:57.158Z",
            "updatedAt": "2025-01-13T16:16:57.158Z",
            "pointOfInterests": [
                {
                    "id": "ecf65bab-2f6b-4b2d-8251-d1befcec1a6f",
                    "name": "aaaaaaaaaa",
                    "description": "",
                    "radius": 20,
                    "areaId": "8a47a2bc-579b-4b40-9a56-072ac7256dfb",
                    "latitude": 43.34284544994483,
                    "longitude": -3.007464408874512,
                    "isDisabled": false,
                    "createdAt": "2025-01-27T14:01:53.632Z",
                    "updatedAt": "2025-01-27T14:01:53.632Z",
                    "tasks": []
                }
            ]
        },
        {
            "id": "566cb472-f810-4a93-9eda-f9d2676fef8b",
            "name": "test4444",
            "description": "asdasd",
            "campaignId": "e2f3b95b-e538-4491-9b73-7dce2af06064",
            "polygon": [
                [
                    43.341689666192,
                    -3.007032796931067
                ],
                [
                    43.34312539612007,
                    -3.005658376864589
                ],
                [
                    43.34237632387197,
                    -3.002909536731613
                ],
                [
                    43.34056602778192,
                    -3.00174986980051
                ]
            ],
            "isDisabled": false,
            "createdAt": "2025-01-13T16:17:31.272Z",
            "updatedAt": "2025-01-13T16:17:31.272Z",
            "pointOfInterests": [
                {
                    "id": "2a9d7ea1-971f-4dcf-8ee4-783561ca1afd",
                    "name": "test",
                    "description": "sadas",
                    "radius": 20,
                    "areaId": "566cb472-f810-4a93-9eda-f9d2676fef8b",
                    "latitude": 43.34103444533574,
                    "longitude": -3.002423899505141,
                    "isDisabled": true,
                    "createdAt": "2025-01-15T15:05:52.291Z",
                    "updatedAt": "2025-01-16T10:00:18.969Z",
                    "tasks": []
                },
                {
                    "id": "b66f29f8-b6fd-4a44-90a2-f356800ae0bd",
                    "name": "qqqq",
                    "description": "",
                    "radius": 20,
                    "areaId": "566cb472-f810-4a93-9eda-f9d2676fef8b",
                    "latitude": 43.34282984464257,
                    "longitude": -3.005586862564087,
                    "isDisabled": false,
                    "createdAt": "2025-01-27T14:01:42.243Z",
                    "updatedAt": "2025-01-27T14:01:42.243Z",
                    "tasks": []
                },
                {
                    "id": "82c5dc94-9ef3-4a7d-9c90-b89291e18401",
                    "name": "eeeeeeeeeeeeeeeeee",
                    "description": "",
                    "radius": 20,
                    "areaId": "566cb472-f810-4a93-9eda-f9d2676fef8b",
                    "latitude": 43.34161261870718,
                    "longitude": -3.003451824188232,
                    "isDisabled": false,
                    "createdAt": "2025-01-27T14:02:03.922Z",
                    "updatedAt": "2025-01-28T13:43:08.906Z",
                    "tasks": []
                }
            ]
        },
        {
            "id": "6e11ca28-7df2-4be0-93c0-cd3e9021709f",
            "name": "test",
            "description": "eeeeeeeeeeeeeeee",
            "campaignId": "e2f3b95b-e538-4491-9b73-7dce2af06064",
            "polygon": [
                [
                    38.31714341766585,
                    -4.638280994663287
                ],
                [
                    38.31215982925831,
                    -4.626598424098145
                ],
                [
                    38.31956774223246,
                    -4.620069928782316
                ],
                [
                    38.32158795077906,
                    -4.634329536972134
                ]
            ],
            "isDisabled": true,
            "createdAt": "2025-01-13T16:07:23.681Z",
            "updatedAt": "2025-01-14T10:29:04.480Z",
            "pointOfInterests": []
        },
        {
            "id": "d82d77a2-edaa-4319-8fda-2ccaf23883f2",
            "name": "TESTING222",
            "description": "22222222222222",
            "campaignId": "e2f3b95b-e538-4491-9b73-7dce2af06064",
            "polygon": [
                [
                    43.34041079611224,
                    -3.001936468132936
                ],
                [
                    43.34111307435104,
                    -3.004638237026225
                ],
                [
                    43.34079314860519,
                    -3.005109974452027
                ],
                [
                    43.33892037871527,
                    -3.003491057377091
                ]
            ],
            "isDisabled": false,
            "createdAt": "2025-01-13T16:18:20.625Z",
            "updatedAt": "2025-01-14T15:23:50.326Z",
            "pointOfInterests": [
                {
                    "id": "84fb25fe-5f33-4e99-92e4-2b8644314791",
                    "name": "asdasd",
                    "description": "asd",
                    "radius": 20,
                    "areaId": "d82d77a2-edaa-4319-8fda-2ccaf23883f2",
                    "latitude": 43.34078979963019,
                    "longitude": -3.004793886785407,
                    "isDisabled": false,
                    "createdAt": "2025-01-15T16:08:32.207Z",
                    "updatedAt": "2025-01-15T16:23:18.473Z",
                    "tasks": []
                },
                {
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
                            "id": "f26d3065-4a62-41f3-abcd-80cbcb7959d4"
                        }
                    ]
                },
                {
                    "id": "9c753265-db42-417a-ba01-e2c31a54f4d6",
                    "name": "test",
                    "description": "",
                    "radius": 20,
                    "areaId": "d82d77a2-edaa-4319-8fda-2ccaf23883f2",
                    "latitude": 43.33934976205169,
                    "longitude": -3.003387451171875,
                    "isDisabled": false,
                    "createdAt": "2025-01-27T14:01:30.094Z",
                    "updatedAt": "2025-01-27T14:01:30.094Z",
                    "tasks": []
                }
            ]
        }
    ],
    "allowedUsers": [
        {
            "id": "1cc39ca3-d79a-4522-89fc-202dfbe8f85f",
            "userId": "5d2ad1a6-bd77-4701-9001-412ec8cc2a0b",
            "campaignId": "e2f3b95b-e538-4491-9b73-7dce2af06064",
            "accessType": "contributor",
            "createdAt": "2025-01-14T10:11:27.631Z",
            "updatedAt": "2025-01-14T10:11:27.631Z",
            "user": {
                "id": "5d2ad1a6-bd77-4701-9001-412ec8cc2a0b",
                "sub": "e21b65cd-d534-4dd8-84a4-4729f6bb6c57"
            }
        }
    ]
}
              */
              const groupedUsers = groupParticipants(campaign?.allowedUsers)
              const areaCount = campaign?.areas?.length
              const pointOfInterestsCount =
                campaign?.areas?.reduce(
                  (acc, area) => acc + area?.pointOfInterests?.length,
                  0
                ) || 0
              const taskCount =
                campaign?.areas?.reduce(
                  (acc, area) =>
                    acc +
                    area?.pointOfInterests?.reduce(
                      (acc, poi) => acc + poi?.tasks?.length,
                      0
                    ),
                  0
                ) || 0

              return (
                <tr
                  key={campaign.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isPastDeadline(campaign.endDatetime) && "opacity-50"
                  }`}
                >
                  {visibleColumns.id && (
                    <td className='border px-2 py-2' title={campaign?.id}>
                      {startIndex + index + 1}
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td className='border px-2 py-2 font-medium text-gray-800 dark:text-white'>
                      {campaign?.name}
                    </td>
                  )}
                  {visibleColumns.description && (
                    <td className='border px-2 py-2 text-sm text-gray-600 dark:text-gray-400'>
                      {campaign?.description || "-"}
                    </td>
                  )}
                  {visibleColumns.location && (
                    <td className='border px-2 py-2 text-sm text-gray-600 dark:text-gray-400'>
                      {campaign.location || "-"}
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className='border px-2 py-2'>
                      {campaign.isOpen ? (
                        <span className='inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-700 dark:text-white'>
                          {t("Open")}
                        </span>
                      ) : (
                        <span
                          className='inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-700 dark:text-white cursor-pointer'
                          onClick={() => handleInviteOnly(campaign.id)}
                        >
                          {t("Invite-only")}
                        </span>
                      )}
                    </td>
                  )}
                  {visibleColumns.dates && (
                    <td className='border px-2 py-2 text-sm'>
                      {
                        <>
                          {campaign.startDatetime && (
                            <span>
                              {t("Start Date")}:{" "}
                              {new Date(
                                campaign.startDatetime
                              ).toLocaleString()}
                            </span>
                          )}
                          {campaign.endDatetime && (
                            <span>
                              <br />
                              {t("Deadline")}:{" "}
                              {new Date(campaign.endDatetime).toLocaleString()}
                            </span>
                          )}
                        </>
                      }
                    </td>
                  )}
                  {visibleColumns.category && (
                    <td className='border px-2 py-2'>{campaign.category}</td>
                  )}
                  {visibleColumns.details && (
                    <td className='border px-2 py-2 text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        {/* Areas */}
                        <button
                          className='rounded px-2 py-1 text-xs font-semibold bg-blue-200 text-blue-800 flex items-center gap-1 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                          title={t("Click to view areas in the campaign")}
                        >
                          <FaDrawPolygon className='inline-block' />
                          {areaCount}
                        </button>

                        {/* Points of Interest */}
                        <button
                          className='rounded px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 flex items-center gap-1 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400'
                          title={t(
                            "Click to view points of interest in the campaign"
                          )}
                        >
                          <MdOutlinePinDrop className='inline-block' />
                          {pointOfInterestsCount}
                        </button>

                        {/* Tasks */}
                        <button
                          className='rounded px-2 py-1 text-xs font-semibold bg-yellow-200 text-yellow-800 flex items-center gap-1 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                          title={t("Click to view tasks in the campaign")}
                        >
                          <FaTasks className='inline-block' />
                          {taskCount}
                        </button>

                        {/* Users */}
                        <button
                          className='rounded px-2 py-1 text-xs font-semibold bg-purple-200 text-purple-800 flex items-center gap-1 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400'
                          title={t("Click to view users in the campaign")}
                        >
                          <FaUsers className='inline-block' />
                          {Object.keys(groupedUsers).length || 0}
                        </button>
                      </div>
                    </td>
                  )}
                  {visibleColumns.createdAt && (
                    <td className='border px-2 py-2'>
                      {new Date(campaign?.createdAt).toLocaleString()}
                    </td>
                  )}
                  {visibleColumns.updatedAt && (
                    <td className='border px-2 py-2'>
                      {new Date(campaign?.updatedAt).toLocaleString()}
                    </td>
                  )}
                  {visibleColumns.gamificated && (
                    <td className='border px-2 py-2'>
                      {campaign?.gameId ? (
                        <span
                          className='inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-700 dark:text-white'
                          title={campaign?.gameId}
                        >
                          {t("Yes")}
                        </span>
                      ) : (
                        <span className='inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-700 dark:text-white'>
                          {t("No")}
                        </span>
                      )}
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td className='border px-2 py-2'>
                      <div className='flex gap-2'>
                        <button
                          title={t("View")}
                          onClick={() => handleView(campaign.id)}
                          className='rounded bg-blue-100 p-2 text-blue-600 hover:bg-blue-200'
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          title={t("Edit")}
                          onClick={() => handleEdit(campaign.id)}
                          className='rounded bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200'
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          title={t("Delete")}
                          onClick={() => handleDelete(campaign.id)}
                          className='rounded bg-red-100 p-2 text-red-600 hover:bg-red-200'
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className='flex justify-between mt-4'>
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            className='px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50'
          >
            {t("Previous")}
          </button>
          <span>
            {t("Page")} {currentPage} {t("of")}{" "}
            {filteredCampaigns?.length > 0
              ? Math.ceil(filteredCampaigns?.length / pageSize)
              : "1"}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={
              currentPage === Math.ceil(filteredCampaigns?.length / pageSize)
            }
            className='px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50'
          >
            {t("Next")}
          </button>
        </div>
      </div>
    </DefaultLayout>
  )
}
