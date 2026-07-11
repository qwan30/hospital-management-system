export function useToast() {
  return {
    toast: (props: { title?: string; description?: string }) => {
      console.warn("Toast:", props);
      alert(props.title + "\n" + props.description);
    }
  };
}
