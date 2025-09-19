package com.text2sql.text2sql_springboot.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "USER_FILES", schema = "public")
public class UserFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // SERIAL
    private Long id;

    @Column(nullable = false, length = 100)
    private String filename;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_user")
    )
    private UserDetails user;

    public UserFile() {
    }

    public UserFile(String filename, UserDetails user) {
        this.filename = filename;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public UserDetails getUser() {
        return user;
    }
}
