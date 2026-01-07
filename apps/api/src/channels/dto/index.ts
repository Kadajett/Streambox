// ============================================
// Channel DTOs
// ============================================

// Param DTOs (URL parameters)
export { ChannelHandleParamDto, ChannelIdParamDto } from './channel-params.dto';

// Request DTOs (request bodies)
export { CreateChannelDto, UpdateChannelDto } from './channel-request.dto';

// Response DTOs (for OpenAPI documentation and type safety)
export {
  ChannelWithStatsDto,
  ChannelSummaryDto,
  ChannelsWithStatsDto,
  ChannelResponseDto,
  ChannelsResponseDto,
} from './channel-response.dto';

// Query DTOs (query parameters)
export { ListChannelsQueryDto, ListChannelsQuerySchema } from './channel-query.dto';
