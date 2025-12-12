package com.jason7599.cocatalk.webconfig;

import com.jason7599.cocatalk.security.StompAuthChannelInterceptor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // turns on WebSocket + STOMP support in Spring
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    @Value("${cors.frontend-origin}")
    private String frontendOrigin;

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(frontendOrigin)
                .withSockJS(); // fallback
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // these are routed to application controllers (@MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");

        // TODO: MAYBE later replace this with using a real external message broker like RabbitMQ, using .enableStompBrokerRelay()
        // where the server can BROADCAST messages to
        registry.enableSimpleBroker("/topic", "/queue");

        // user-specific queues
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(stompAuthChannelInterceptor);
    }
}
