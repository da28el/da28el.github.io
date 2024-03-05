class vec3
{
    create()
    {
        return new Float32Array([0, 0, 0]);
    }

    add(t, n, r) 
    {
        t[0] = n[0] + r[0]; t[1] = n[1] + r[1]; t[2] = n[2] + r[2];
        return t;
    }

    sub(t, n, r) 
    {
        t[0] = n[0] - r[0]; t[1] = n[1] - r[1]; t[2] = n[2] - r[2];
        return t;
    }

    scale(t, n) 
    {
        t[0] = n; t[1] = n; t[2] = n;
        return t;
    }

}