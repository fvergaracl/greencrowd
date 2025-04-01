import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import dynamic from "next/dynamic";
import { useDashboard } from "@/context/DashboardContext";
import CampaignsScreen from "@/screens/CampaignsScreen";
import { useRouter } from "next/router";
import { useTranslation } from "@/hooks/useTranslation";

export default function Dashboard() {
  const { t } = useTranslation();
  const { position, selectedCampaign } = useDashboard();
  const [puntos, setPuntos] = useState([]);
  const [poligonos, setPoligonos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const { invite: campaignId } = router.query;

  useEffect(() => {
    if (campaignId) {
      console.log("Invite campaign ID:", campaignId);
    }
  }, [campaignId]);

  if (!selectedCampaign) {
    return (
      <DashboardLayout>
        <CampaignsScreen />
      </DashboardLayout>
    );
  }

  const Map = dynamic(() => import("@/components/Common/Map"), {
    ssr: false,
  });
  return (
    <DashboardLayout>
      {!position ? (
        <Modal isVisible={isModalVisible}>
          <h2>
            {t("We need your location to continue. Please enable location")}
          </h2>
          <p>
            {t(
              "If you are using a desktop computer, please use a mobile device"
            )}
          </p>
        </Modal>
      ) : (
        <Map
          showMyLocation={true}
          points={puntos}
          polygons={poligonos}
          polygonsMultiColors={false}
          polygonsTitle={false}
          selectedCampaign={selectedCampaign}
          showMapControl={true}
        />
      )}
    </DashboardLayout>
  );
}

function Modal({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: React.ReactNode;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow">{children}</div>
    </div>
  );
}
