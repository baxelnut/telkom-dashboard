// Style
import "./CardContent.css";
// Components
import Error from "../states/Error";
import Loading from "../states/Loading";

export default function CardContent({ loading, error, children }) {
  return (
    <>
      {loading || error ? (
        loading ? (
          <Loading backgroundColor="transparent" />
        ) : (
          <Error message={error} />
        )
      ) : (
        <div className="card-content">{children}</div>
      )}
    </>
  );
}
