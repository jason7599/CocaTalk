package com.jason7599.cocatalk;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @PostMapping("/post")
    public String post() {
        return "post";
    }
}
