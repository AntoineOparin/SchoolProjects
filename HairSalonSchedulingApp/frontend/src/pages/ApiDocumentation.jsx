import React from "react";
import { useState } from "react";
import axios from "../utils/axios";
import Logo from "../components/Logo.jsx";
import Spinner from "../components/Spinner";

export default function ApiDocumentation() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiEndpoints = [
    { method: "GET", title: "/api/", path: "/api/" },
    { method: "GET", title: "/api/appointments", path: "/api/appointments" },
    {
      method: "GET",
      title: "/api/appointments/:id",
      path: `/api/appointments/${1}`,
    },
    { method: "GET", title: "/api/users", path: "/api/users" },
    { method: "GET", title: "/api/users/:id", path: `/api/users/${1}` },
    { method: "GET", title: "/api/services", path: "/api/services" },
    { method: "GET", title: "/api/services/:id", path: `/api/services/${1}` },
    { method: "GET", title: "/api/reports", path: "/api/reports" },
    { method: "GET", title: "/api/reports/:id", path: `/api/reports/${3}` },
  ];

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex min-h-screen bg-sky-800 p-1">
        {/* middle side */}
        <div className="w-1/2 bg-sky-200 rounded-lg m-1 p-2">
          <div className="space-y-4">
            <h2 className="text-2xl text-sky-950 font-bold mb-4">API Docs</h2>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">
                API Endpoints: http://...studentIP...:5008
              </h3>
              {apiEndpoints.map((endpoint, index) => (
                <p
                  key={index}
                  onClick={() => {
                    setLoading(true);
                    axios
                      .get(endpoint.path)
                      .then((res) => {
                        setResponse(res.data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error(err);
                        setLoading(false);
                      });
                  }}
                  className="hover:bg-gray-300 min-w-auto p-1 cursor-pointer"
                >
                  {endpoint.method} {endpoint.path}
                </p>
              ))}
              <h3 className="font-semibold my-2">CURL:</h3>
              <pre className="bg-gray-200 p-2 rounded text-sm whitespace-pre-wrap break-words my-2">
                <p className="font-bold text-sky-950 mb-2">Get TOKEN:</p>
                <p className="bg-gray-100 p-2 rounded">{`TOKEN=$(curl -s -X POST \\
  -H 'Accept: application/json' \\
  -H 'Content-Type: application/json' \\
  --data '{
    "username": "<username>",
    "password": "<password>"
  }' \\
  http://10.172.25.124:5008/auth/login | jq -r '.access_token')`}</p>
              </pre>
              <pre className="bg-gray-200 p-2 rounded text-sm whitespace-pre-wrap break-words">
                <p className="font-bold text-sky-950 mb-2">JWT required:</p>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">Create Appointment:</p>
                    <p className="bg-gray-100 p-2 rounded">{`curl -X POST \\
  http://10.172.25.124:5008/appointments/create \\
  -H 'Authorization: Bearer $(TOKEN)' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "client_id": "<id>",
    "professional_id": "<id>",
    "service_id": "<id>",
    "start_time": "<time>",
    "end_time": "<time>",
    "location": "<location>",
    "status": "Scheduled",
    "cost": "<cost>"
  }'`}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Update Appointment:</p>
                    <p className="bg-gray-100 p-2 rounded">{`curl -X PUT \\
  http://10.172.25.124:5008/appointments/<id> \\
  -H 'Authorization: Bearer $(TOKEN)' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "appointment_id": "<id>",
    "status": "<status>"
  }'`}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Delete Appointment:</p>
                    <p className="bg-gray-100 p-2 rounded">{`curl -X POST \\
  http://10.172.25.124:5008/admin/manage-appointments \\
  -H 'Authorization: Bearer $(TOKEN)' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "appointment_id": "<id>",
    "action": "delete"
  }'`}</p>
                  </div>
                </div>
              </pre>
            </div>
          </div>
        </div>
        {/* right side */}
        <div className="w-1/2 bg-sky-200 rounded-lg m-1 p-2">
          <div className="space-y-4">
            <h2 className="text-2xl text-sky-950 font-bold mb-4">
              API Response
            </h2>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="bg-gray-200 p-2 rounded text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
