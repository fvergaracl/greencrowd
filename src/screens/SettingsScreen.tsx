import React, { useState, useEffect, useRef, useMemo } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import AdminLayout from "@/components/AdminLayout"
import { useDashboard } from "@/context/DashboardContext"
import { useAdmin } from "@/context/AdminContext"
import { useTranslation } from "@/hooks/useTranslation"
import LanguageDropdown from "@/components/Common/LanguageDropdown"
import axios from "axios"
import Swal from "sweetalert2"

const SettingsScreen = ({ DashboardContext }) => {
  const { t } = useTranslation()
  const { setUser, logout, user } = DashboardContext()
  const lastFetchTime = useRef<number | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const now = Date.now()
      if (lastFetchTime.current && now - lastFetchTime.current < 60000) {
        return
      }

      try {
        const response = await axios.get("/api/auth/user")
        const userData = response.data

        setUser({
          id: userData.sub,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          pictureKeycloak: userData.pictureKeycloak,
          roles: userData.roles,
          locale: userData.locale
        })

        lastFetchTime.current = now
      } catch (error) {
        console.error("Error fetching user data:", error)
        Swal.fire({
          icon: "error",
          title: t("Error"),
          text: t(
            "Failed to load user information. You will be redirected to the login page."
          ),
          timer: 10000,
          showConfirmButton: true,
          confirmButtonText: t("Ok")
        }).then(() => {
          logout()
        })
      }
    }

    fetchUser()
  }, [setUser, t, logout])

  const photoUrl = useMemo(
    () => user?.pictureKeycloak || user?.picture || null,
    [user?.pictureKeycloak, user?.picture]
  )

  const userDataMemo = useMemo(
    () => ({
      id: user?.id || t("No ID"),
      name: user?.name || t("No Name"),
      email: user?.email || t("No Email"),
      roles: user?.roles || []
    }),
    [user, t]
  )

  const initials = useMemo(() => {
    if (!user?.name) return "NN"
    return user.name
      .split(" ")
      .map(word => word[0])
      .join("")
  }, [user?.name])

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.put("/api/updatePhotoUser", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      if (response.status === 200) {
        const newPhotoUrl = response.data.url

        setUser(prev => ({
          ...prev,
          picture: newPhotoUrl,
          pictureKeycloak: newPhotoUrl
        }))

        Swal.fire({
          icon: "success",
          title: t("Success!"),
          text: t("Photo updated successfully")
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("Oops..."),
        text: t("Failed to upload the photo")
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleLogout = () => {
    Swal.fire({
      title: t("Are you sure?"),
      text: t("You will be logged out"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes"),
      cancelButtonText: t("No")
    }).then(result => {
      if (result.isConfirmed) logout()
    })
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='bg-white shadow-md rounded-lg p-6 mb-6 flex flex-row items-center gap-6'>
        <div className='flex flex-col items-center pb-4 flex-[1]'>
          <div className='h-20 w-20 rounded-full bg-gray-200 overflow-hidden mb-4'>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt='Profile'
                className='w-full h-full object-cover w-3xs'
                data-cy='settings-profile-photo'
                style={{ maxWidth: "15rem" }}
              />
            ) : (
              <div
                className='flex items-center justify-center w-full h-full bg-blue-500 text-white text-xl font-bold'
                data-cy='settings-profile-initials'
              >
                {initials}
              </div>
            )}
          </div>

          <label
            className='cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mt-3 w-full text-center'
            data-cy='settings-upload-photo-button'
          >
            {t("Upload Photo")}
            <input
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
              data-cy='settings-upload-photo-input'
            />
          </label>
        </div>

        <div className='flex-[4]'>
          <p className='text-gray-600'>{t("User ID")}:</p>
          <p className='font-medium text-gray-800'>{userDataMemo.id}</p>
          <hr className='my-4' />

          <p className='text-gray-600'>{t("Name")}:</p>
          <p className='font-medium text-gray-800'>{userDataMemo.name}</p>

          <p className='text-gray-600 mt-2'>{t("Email")}:</p>
          <p className='font-medium text-gray-800'>{userDataMemo.email}</p>

          {userDataMemo.roles.length > 0 ? (
            <>
              <p className='text-gray-600 mt-4 mb-2'>{t("Roles")}:</p>
              <div className='flex flex-wrap gap-2'>
                {userDataMemo.roles.map(role => (
                  <span
                    key={role}
                    className='inline-block bg-blue-100 text-blue-800 text-sm font-medium py-1 px-3 rounded-lg shadow-sm'
                    data-cy='settings-user-role'
                  >
                    {t(role)}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className='text-gray-500 mt-4'>{t("No roles assigned")}.</p>
          )}
          <div className='font-medium text-gray-800 flex items-center gap-2'>
            <LanguageDropdown />
          </div>
        </div>
      </div>

      <div className='text-center mt-2'>
        <button
          onClick={handleLogout}
          className='py-2 mt-2 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600'
          data-cy='settings-logout-button'
        >
          {t("Logout")}
        </button>
      </div>
    </div>
  )
}

export default function SettingsInApp() {
  const { t } = useTranslation()
  return (
    <DashboardLayout>
      <div className='pt-6 max-full mx-auto text-center'>
        <h1 className='text-3xl font-bold text-gray-800 mb-6'>
          {t("Settings")}
        </h1>
      </div>
      <SettingsScreen DashboardContext={useDashboard} />
    </DashboardLayout>
  )
}

const SettingsInAdmin = () => {
  const { t } = useTranslation()
  return (
    <AdminLayout>
      <div className='pt-6 max-full mx-auto text-center'>
        <h1 className='text-3xl font-bold text-white mb-6'>{t("Settings")}</h1>
      </div>
      <SettingsScreen DashboardContext={useAdmin} />
    </AdminLayout>
  )
}

export { SettingsInAdmin }
