import { useEffect, useState } from "react"
import { Autocomplete, TextField } from "@mui/material"
import dynamic from "next/dynamic"
import DefaultLayout from "@/components/AdminLayout"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import { useTranslation } from "@/hooks/useTranslation"
import axios from "axios"
import Swal from "sweetalert2"
import { getApiBaseUrl } from "@/config/api"

const Map = dynamic(() => import("@/components/KmlPreviewMap"), {
  ssr: false
})

export default function ImportKMLPage() {
  const { t } = useTranslation()
  const [kmlPolygons, setKmlPolygons] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [defaultCampaignId, setDefaultCampaignId] = useState("")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${getApiBaseUrl()}/admin/campaigns/areas`)
      setCampaigns(res.data)
    } catch (err) {
      Swal.fire(t("Error"), t("Failed to load campaigns"), "error")
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const parser = new DOMParser()
    const kmlDoc = parser.parseFromString(text, "application/xml")

    const placemarks = Array.from(kmlDoc.getElementsByTagName("Placemark"))

    const polygons = placemarks.map(pm => {
      const name = pm.getElementsByTagName("name")[0]?.textContent || ""
      const description =
        pm.getElementsByTagName("description")[0]?.textContent || ""
      const coordsText = pm
        .getElementsByTagName("coordinates")[0]
        ?.textContent?.trim()

      const polygon =
        coordsText?.split(/\s+/).map(coordStr => {
          const [lng, lat] = coordStr.split(",").map(Number)
          return [lat, lng]
        }) || []

      return {
        name,
        description,
        polygon,
        campaignId: defaultCampaignId
      }
    })

    setKmlPolygons(polygons)
    setSelectedIndex(0)
  }

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...kmlPolygons]
    updated[index][field] = value
    setKmlPolygons(updated)
  }

  const handleSubmit = async () => {
    const clearKmlPolygons = kmlPolygons.filter(p => p.polygon.length >= 3)
    if (clearKmlPolygons.length === 0) {
      Swal.fire(
        t("No Valid Areas"),
        t("Please ensure each area has at least 3 points"),
        "warning"
      )
      return
    }
    const missing = clearKmlPolygons.find(
      p => !p.name || !p.campaignId || p.polygon.length < 3
    )
    if (missing) {
      Swal.fire(
        t("Missing Fields"),
        t("Each area must have a name, campaign and valid polygon"),
        "warning"
      )
      return
    }

    try {
      setLoading(true)
      await Promise.all(
        clearKmlPolygons.map(p =>
          axios.post(`${getApiBaseUrl()}/admin/areas`, {
            name: p.name,
            description: p.description,
            polygon: p.polygon,
            campaignId: p.campaignId
          })
        )
      )
      Swal.fire(
        t("Success"),
        t("All areas were imported successfully"),
        "success"
      )
      setKmlPolygons([])
      setSelectedIndex(null)
    } catch (err) {
      console.error(err)
      Swal.fire(t("Error"), t("Failed to import areas"), "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={t("Import Areas from KML")}
        breadcrumbPath={t("Areas / Import from KML")}
      />

      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6'>
        <h2 className='text-xl font-semibold mb-4'>
          {t("Step 1: Select Default Campaign")}
        </h2>
        <Autocomplete
          options={campaigns}
          getOptionLabel={option => option.name || ""}
          value={campaigns.find(c => c.id === defaultCampaignId) || null}
          onChange={(e, newValue) => {
            setDefaultCampaignId(newValue?.id || "")
          }}
          renderInput={params => (
            <TextField
              {...params}
              label={t("Select Campaign")}
              variant='outlined'
              className='bg-white dark:bg-gray-700 rounded'
              InputLabelProps={{
                className: "text-gray-700 dark:text-gray-300"
              }}
              InputProps={{
                ...params.InputProps,
                className: "dark:text-white"
              }}
            />
          )}
        />
      </div>

      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>
          {t("Step 2: Upload KML File")}
        </h2>
        <input type='file' accept='.kml' onChange={handleFileUpload} />
      </div>

      {kmlPolygons.length > 0 && (
        <div className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <Map
              polygons={kmlPolygons.map(p => p.polygon)}
              selectedIndex={selectedIndex ?? undefined}
              colors={kmlPolygons.map(p =>
                p.name && p.campaignId ? "limegreen" : "orange"
              )}
              onSelect={setSelectedIndex}
              onDelete={index => {
                const updated = [...kmlPolygons]
                updated.splice(index, 1)
                setKmlPolygons(updated)
                setSelectedIndex(null)
              }}
            />
          </div>

          {selectedIndex !== null && (
            <div className='bg-white dark:bg-gray-800 p-4 rounded shadow-md'>
              <h3 className='text-lg font-semibold'>
                {t("Editing Area")} {selectedIndex + 1}
              </h3>

              <div className='mb-2'>
                <label className='block text-sm'>{t("Name")}</label>
                <input
                  value={kmlPolygons[selectedIndex].name}
                  onChange={e =>
                    handleChange(selectedIndex, "name", e.target.value)
                  }
                  className='w-full p-2 rounded border dark:bg-gray-700 dark:text-white'
                />
              </div>

              <div className='mb-2'>
                <label className='block text-sm'>{t("Description")}</label>
                <input
                  value={kmlPolygons[selectedIndex].description}
                  onChange={e =>
                    handleChange(selectedIndex, "description", e.target.value)
                  }
                  className='w-full p-2 rounded border dark:bg-gray-700 dark:text-white'
                />
              </div>

              <div className='mb-2'>
                <label className='block text-sm'>{t("Campaign")}</label>
                <Autocomplete
                  options={campaigns}
                  getOptionLabel={option => option.name || ""}
                  value={
                    campaigns.find(
                      c => c.id === kmlPolygons[selectedIndex].campaignId
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    handleChange(
                      selectedIndex,
                      "campaignId",
                      newValue?.id || ""
                    )
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("Select Campaign")}
                      variant='outlined'
                      className='bg-white dark:bg-gray-700 rounded'
                      InputLabelProps={{
                        className: "text-gray-700 dark:text-gray-300"
                      }}
                      InputProps={{
                        ...params.InputProps,
                        className: "dark:text-white"
                      }}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {kmlPolygons.length > 0 && (
        <div className='mt-6'>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded'
          >
            {loading ? t("Importing...") : t("Import Selected Areas")}
          </button>
        </div>
      )}
    </DefaultLayout>
  )
}
