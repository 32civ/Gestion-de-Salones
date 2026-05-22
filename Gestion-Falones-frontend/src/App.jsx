// import { useEffect, useState } from "react";
// import { obtenerSalones } from "./api/salonesService";

// function App() {

//   const [salones, setSalones] = useState([]);

//   useEffect(() => {

//   const cargarSalones = async () => {

//     try {

//       const data = await obtenerSalones();

//       console.log(data);

//       setSalones(data);

//     } catch (error) {

//       console.error(error);

//     }

//   };

//   cargarSalones();

// }, []);

//   return (
//     <div>
//       <h1>Salones</h1>

//       {salones.map((salon) => (
//         <div key={salon.id}>
//           <h3>{salon.nombre}</h3>
//           <p>Capacidad: {salon.capacidad}</p>
//         </div>
//       ))}
//     </div>
//   );

  
// }

// export default App;

import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;