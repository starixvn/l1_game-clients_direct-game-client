require.context("../../../public", false, /\.(png|jpe?g|svg)$/);

export const getImageUrl = (id: number, isActive: boolean) => {
    const active = isActive ? "active" : "inactive";
    return `/images/icon-${id}-${active}.png`;
};
