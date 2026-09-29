from .astar_router import flood_router

def get_flood_safe_route(origin_node, dest_node, current_rainfall_mm_hr=48.5, max_safe_depth_cm=25.0):
    return flood_router.calculate_route_comparison(
        origin_node, dest_node, current_rainfall_mm_hr, max_safe_depth_cm
    )
