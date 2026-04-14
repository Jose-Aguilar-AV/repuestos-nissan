import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRepuesto, getStock } from "../services/api";

export default function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState({});
  const [stock, setStock] = useState(0);

  useEffect(() => {
    getRepuesto(id).then(setProducto);
    getStock(id).then(r => setStock(r.stock));
  }, [id]);

  return (
    <div>
      <h2>{producto.nombre}</h2>
      <p>{producto.descripcion}</p>
      <p>Stock disponible: {stock}</p>
    </div>
  );
}